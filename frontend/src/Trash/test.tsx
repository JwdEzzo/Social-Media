import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const postSchema = z.object({
  description: z.string().min(0),
  imageUrl: z.string().optional(),
});

type PostSchema = z.infer<typeof postSchema>;

type UploadMode = "url" | "file";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Partial<PostSchema>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: {
    description: string;
    imageUrl?: string;
    image?: File | null;
  }) => Promise<void>;
}

export default function PostModal({
  isOpen,
  onClose,
  initialValues,
  isSubmitting = false,
  submitLabel = "Submit",
  onSubmit,
}: PostModalProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      description: initialValues?.description ?? "",
      imageUrl: initialValues?.imageUrl ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        description: initialValues?.description ?? "",
        imageUrl: initialValues?.imageUrl ?? "",
      });
      // set preview if initial file url provided (only for url mode)
      if (initialValues?.imageUrl) {
        setUploadMode("url");
      }
    } else {
      // cleanup object URLs
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setUploadMode("url");
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialValues]);

  async function handleFormSubmit(data: PostSchema) {
    try {
      await onSubmit({
        description: data.description,
        imageUrl: uploadMode === "url" ? data.imageUrl : undefined,
        image: uploadMode === "file" ? selectedFile : null,
      });
      handleClose();
    } catch (err) {
      console.error("Post submit failed", err);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        alert("Please select an image file");
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert("Please drop an image file");
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    form.reset();
    removeSelectedFile();
    setUploadMode("url");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg">
        <CardHeader>
          <CardTitle>{submitLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadMode("url")}
                  disabled={isSubmitting}
                >
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadMode("file")}
                  disabled={isSubmitting}
                >
                  Upload File
                </Button>
              </div>

              {uploadMode === "url" && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {uploadMode === "file" && (
                <div className="space-y-2">
                  <FormLabel>Upload Image</FormLabel>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedFile.name}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedFile();
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {(uploadMode === "url" && form.watch("imageUrl")) ||
              (uploadMode === "file" && previewUrl) ? (
                <div className="mt-2">
                  <img
                    src={
                      uploadMode === "url"
                        ? form.watch("imageUrl")
                        : previewUrl!
                    }
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a caption..."
                        {...field}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {submitLabel}
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
