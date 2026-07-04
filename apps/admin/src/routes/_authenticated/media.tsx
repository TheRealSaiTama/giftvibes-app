import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/admin/admin-shell";
import { MediaGrid, uploadFileToBucket } from "@/components/admin/media-picker";
import { registerMedia } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/media")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const runRegister = useServerFn(registerMedia);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { path, url } = await uploadFileToBucket(file);
        await runRegister({
          data: {
            path, url,
            alt: file.name.replace(/\.[^.]+$/, ""),
            mime_type: file.type,
            size_bytes: file.size,
          },
        });
      }
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success(`${files.length} uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Media library" description="Every image used across the storefront. Hover to copy or delete.">
        <input ref={fileRef} type="file" multiple accept="image/*" hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
          Upload images
        </Button>
      </PageHeader>

      <div className="gv-panel p-4">
        <MediaGrid
          onDelete
          onPick={(url) => {
            navigator.clipboard.writeText(url);
            toast.success("URL copied");
          }}
        />
      </div>
    </div>
  );
}
