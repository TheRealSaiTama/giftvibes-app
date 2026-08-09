import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { registerMedia, deleteMedia, ensureSiteMediaBucket } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ImageIcon, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BUCKET = "site-media";

export type MediaAsset = {
  id: string;
  path: string;
  url: string;
  alt: string | null;
  mime_type: string | null;
};

export async function uploadFileToBucket(file: File) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: urlData.publicUrl };
}

export function MediaPicker({
  value,
  onChange,
  hideUrl = false,
}: {
  value: string;
  onChange: (url: string) => void;
  // ponytail: when true, hides the "paste a URL" text input below the
  // thumbnail. Use this when the picker is for a primary/secondary image
  // that should only come from the media library, not arbitrary URLs.
  hideUrl?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const runRegister = useServerFn(registerMedia);
  const runEnsureBucket = useServerFn(ensureSiteMediaBucket);

  async function handleOpen(isOpen: boolean) {
    if (isOpen) {
      try { await runEnsureBucket({ data: undefined }); } catch { /* service role key missing locally */ }
    }
    setOpen(isOpen);
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { path, url } = await uploadFileToBucket(file);
      await runRegister({
        data: {
          path,
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          mime_type: file.type,
          size_bytes: file.size,
        },
      });
      qc.invalidateQueries({ queryKey: ["media"] });
      onChange(url);
      setOpen(false);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 rounded-md bg-surface-2 overflow-hidden flex items-center justify-center border border-border shrink-0 relative">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                {value ? "Replace" : "Choose image"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Choose or upload an image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload from computer
                  </Button>
                </div>
                <MediaGrid
                  onPick={(url) => {
                    onChange(url);
                    setOpen(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Remove
            </Button>
          )}
        </div>
        {/* Never show the raw URL when hideUrl — product form primary/secondary use this. */}
        {!hideUrl && (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
            className="text-xs font-mono"
          />
        )}
      </div>
    </div>
  );
}

export function MediaGrid({
  onPick,
  onDelete,
}: {
  onPick?: (url: string, asset: MediaAsset) => void;
  onDelete?: boolean;
}) {
  const qc = useQueryClient();
  const runDelete = useServerFn(deleteMedia);
  const { data, isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("id, path, url, alt, mime_type")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MediaAsset[];
    },
  });

  async function handleDelete(asset: MediaAsset) {
    if (!confirm("Delete this image? This can't be undone.")) return;
    try {
      await runDelete({ data: { id: asset.id, path: asset.path } });
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4 text-center">Loading media…</div>;
  }
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground py-4 text-center">No media uploaded yet.</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
      {data.map((asset) => (
        <div key={asset.id} className="relative group">
          <button
            type="button"
            onClick={() => onPick?.(asset.url, asset)}
            className="block w-full aspect-square rounded overflow-hidden border border-border hover:border-primary transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.alt || ""} className="w-full h-full object-cover" />
          </button>
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(asset)}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
