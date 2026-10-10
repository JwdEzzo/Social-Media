import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

import { useState, useRef, useEffect } from "react";

interface PostFormModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  handleSubmit: (data: PostFormData) => void;
  handleClose: () => void;
  initialValues?: {
    description?: string;
    imageUrl?: string;
  };
  mode: "create" | "edit";
  title: string;
}

type PostSchema = z.infer<typeof postSchema>;

type UploadMode = "url" | "file";

const postSchema = z.object({
  description: z.string().min(0, "Description is required"),
  imageUrl: z.string().optional(),
});

export interface PostFormData {
  description: string;
  imageUrl?: string;
  file?: File;
  uploadMode: "url" | "file";
}

function PostFormModal({
  isSubmitting,
  initialValues,
  mode,
  title,
  handleSubmit,
  handleClose,
  isOpen,
}: PostFormModalProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      description: initialValues?.description || "",
      imageUrl: initialValues?.imageUrl || "",
      // imageUrl:
      //   "imageUrl" in initialValues &&
      //   typeof initialValues.imageUrl === "string"
      //     ? initialValues.imageUrl
      //     : "",
    },
  });

  async function handleFormSubmit(data: PostSchema) {
    try {
      if (uploadMode === "url" && !data.imageUrl) {
        form.setError("imageUrl", { message: "Image URL is required" });
        return;
      }

      if (uploadMode === "file" && !selectedFile) {
        return;
      }

      handleSubmit({
        description: data.description,
        imageUrl: data.imageUrl,
        file: selectedFile || undefined,
        uploadMode,
      });

      handleClose();
    } catch (error) {
      console.error("Failed to submit post:", error);
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
  // Random sentences generator
  const getRandomSentence = () => {
    const sentences = [
      "Just another beautiful day!",
      "Living my best life.",
      "Creating memories that last forever.",
      "Chasing dreams and catching stars.",
      "Life is an adventure, embrace it!",
      "Making today count.",
      "Happiness is found in simple moments.",
      "Grateful for this amazing journey.",
      "Capturing the essence of joy.",
      "Every moment is a fresh beginning.",
      "Finding beauty in unexpected places.",
      "Creating my own sunshine.",
      "Life is too short for boring moments.",
      "Exploring the world one step at a time.",
      "In pursuit of happiness and good vibes.",
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  useEffect(() => {
    if (isOpen && mode === "create") {
      // Only generate random data for create mode
      const randomNumber = Math.floor(Math.random() * 1000);
      form.setValue(
        "imageUrl",
        `https://picsum.photos/1080/1920?random=${randomNumber}`,
      );
      form.setValue("description", getRandomSentence());
    } else if (isOpen && mode === "edit" && initialValues) {
      // Set initial values for edit mode
      form.setValue("description", initialValues.description || "");
      form.setValue("imageUrl", initialValues.imageUrl || "");
    }
  }, [isOpen, mode, initialValues, form]);

  useEffect(() => {
    // Clean up preview URL when modal closes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4"
      onClick={handleClose}
    >
      <Card
        className="my-auto w-full max-w-md gap-5 rounded-xl border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-center text-base font-semibold">
            {title || `${mode === "create" ? "Create" : "Edit"} Post`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              {/* Upload Mode Toggle */}
              <div className="flex items-center gap-2">
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

              {/* URL Mode */}
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

              {/* File Upload Mode */}
              {uploadMode === "file" && (
                <div className="space-y-2">
                  <FormLabel>Upload Image</FormLabel>
                  <div
                    className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/40"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
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
                          <X className="size-4" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground/80">
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

              {/* Image Preview */}
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
                    className="h-56 w-full rounded-lg border border-border object-cover"
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

              {/* Random description button - only show in create mode */}
              {mode === "create" && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      form.setValue("description", getRandomSentence())
                    }
                    disabled={isSubmitting}
                  >
                    Random Description
                  </Button>
                </div>
              )}

              {/* Error message for form-level errors */}
              {form.formState.errors.root && (
                <FormMessage>{form.formState.errors.root.message}</FormMessage>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-500 font-semibold text-white hover:bg-sky-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {mode === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : mode === "create" ? (
                    "Create Post"
                  ) : (
                    "Update Post"
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

export default PostFormModal;
