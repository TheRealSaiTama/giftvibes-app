"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  currency: string;
};

const formSchema = z.object({
  description: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().optional(),
  gst: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  pincode: z.coerce.number().min(100000, "Pincode must be 6 digits"),
  address: z.string().min(1, "Address is required"),
  orderNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EnquiryFormContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts?: Product[];
  onSubmitAfter?: () => void;
}

export function EnquiryFormContent({ open, onOpenChange, selectedProducts = [], onSubmitAfter }: EnquiryFormContentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      fullName: "",
      companyName: "",
      gst: "",
      phone: "",
      email: "",
      quantity: 1,
      pincode: 0,
      address: "",
      orderNotes: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: true,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const submitData = new FormData();
      submitData.append('fullName', data.fullName);
      submitData.append('companyName', data.companyName || '');
      submitData.append('phone', data.phone);
      submitData.append('email', data.email);
      submitData.append('quantity', data.quantity.toString());
      submitData.append('pincode', data.pincode.toString());
      submitData.append('address', data.address);
      submitData.append('description', data.description || '');
      submitData.append('gst', data.gst || '');
      submitData.append('orderNotes', data.orderNotes || '');
      submitData.append('selectedProducts', JSON.stringify(selectedProducts));
      
      // Add files
      files.forEach((file) => {
        submitData.append('files', file);
      });
      
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        body: submitData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Enquiry submitted successfully!');
        form.reset();
        setFiles([]);
        onOpenChange(false);
        onSubmitAfter?.();
      } else {
        toast.error(result.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting. Please try again.');
    }
  };

  // Pre-fill description if selected
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const productList = selectedProducts.map(p => `${p.name} - ₹${p.price}`).join('\n');
      form.setValue('description', `Interested in the following products:\n${productList}`);
    }
  }, [selectedProducts, form]);

  return (
    <DialogContent className="w-full max-w-4xl p-6 rounded-lg border border-gray-200 bg-white max-h-[90vh] overflow-y-auto">
      {selectedProducts.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-[#124559] mb-3">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                <Image src={product.image} alt={product.name} width={60} height={60} className="object-cover rounded" />
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-[#124559] font-semibold">{product.currency} {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DialogHeader className="space-y-4 text-center mb-8">
        <span className="inline-block px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded-full">
          Tailored Solutions
        </span>
        <DialogTitle className="text-3xl font-bold text-[#124559]">
          Product Enquiry Form
        </DialogTitle>
        <DialogDescription className="max-w-2xl mx-auto text-gray-600">
          Share your requirements for premium diaries and corporate gifts. Our team will respond within 24 hours with personalized options and pricing.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Email Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Order Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Quantity <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      min={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Pincode <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter pincode"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                      min={100000}
                      max={999999}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Address Field */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Delivery Address <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your complete delivery address"
                    className="min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all resize-vertical"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          {/* Description and GST Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your requirements (e.g., customization, quantities, deadlines)"
                      className="min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <div>
              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">GST Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter GST number (optional)"
                  className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all"
                  {...form.register("gst")}
                />
              </FormControl>
            </div>
          </div>

          {/* Order Notes */}
          <FormField
            control={form.control}
            name="orderNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special instructions or preferences"
                    className="min-h-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#124559] focus:ring-2 focus:ring-[#124559]/10 transition-all resize-vertical"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Attach Design Files (Optional)</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? "border-[#124559] bg-[#124559]/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600 mb-2">
                {isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mb-4">Supports PNG, JPG, PDF up to 10MB each</p>
              {files.length > 0 && (
                <p className="text-sm font-medium text-[#124559]">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {files.map((file, idx) => (
                  <div key={idx} className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 px-8 bg-[#124559] hover:bg-[#0f3d4a] text-white font-semibold rounded-lg transition-colors flex-1 sm:flex-none"
            >
              Submit Enquiry
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
