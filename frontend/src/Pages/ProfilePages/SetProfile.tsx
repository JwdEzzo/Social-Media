import { useAuth } from "@/auth/useAuth";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, ImageIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useGetUserByUsernameQuery,
  useUpdateUserProfileWithUrlMutation,
  useUpdateUserProfileWithUploadMutation,
} from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";
import type { UpdateProfileRequestDto } from "@/types/request-types";
import { useEffect, useState, useRef } from "react";

const updateProfileSchema = z.object({
  bioText: z.string().nullable().optional(),
  profilePictureUrl: z.string().optional(),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
type UploadMode = "url" | "file";

function SetProfile() {
  const { username } = useAuth();
  const [
    updateUserProfileWithUrl,
    { isLoading: isUpdatingUrl, isError: isUrlError, isSuccess: isUrlSuccess },
  ] = useUpdateUserProfileWithUrlMutation();
  const [
    updateUserProfileWithUpload,
    {
      isLoading: isUpdatingUpload,
      isError: isUploadError,
      isSuccess: isUploadSuccess,
    },
  ] = useUpdateUserProfileWithUploadMutation();
  const { data: user } = useGetUserByUsernameQuery(username!, {
    skip: !username,
  });
  const navigate = useNavigate();

  const [uploadMode, setUploadMode] = useState<UploadMode>("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = isUpdatingUrl || isUpdatingUpload;
  const isError = isUrlError || isUploadError;
  const isSuccess = isUrlSuccess || isUploadSuccess;

  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bioText: user?.bioText || "",
      profilePictureUrl: user?.profilePictureUrl || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        bioText: user.bioText || "",
        profilePictureUrl: user.profilePictureUrl || "",
      });
    }
  }, [user, form]);

  async function handleUpdateProfile(data: UpdateProfileSchema) {
    try {
      if (uploadMode === "url") {
        if (!data.profilePictureUrl || data.profilePictureUrl.length < 8) {
          // ← Validate here instead
          form.setError("profilePictureUrl", {
            message: "Image URL is required (minimum 8 characters)",
          });
          return;
        }
        const updateRequest: { username: string } & UpdateProfileRequestDto = {
          username: username!,
          bioText: data.bioText || "",
          profilePictureUrl: data.profilePictureUrl,
        };
        await updateUserProfileWithUrl(updateRequest).unwrap();
      } else {
        if (!selectedFile) {
          alert("Please select an image file.");
          return;
        }
        await updateUserProfileWithUpload({
          username: username!,
          bioText: data.bioText || undefined,
          profileImage: selectedFile,
        }).unwrap();
      }

      // Reset form and state on success
      form.reset({
        bioText: "",
        profilePictureUrl: "",
      });
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadMode("url");

      navigate(`/userprofile/${username}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Set up failed:", error);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="w-full gap-6 rounded-xl border-border shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">
                <div>Set Up Profile</div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdateProfile)}
                className="space-y-5"
              >
                {/* Bio Field */}
                <FormField
                  control={form.control}
                  name="bioText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Bio"
                          {...field}
                          disabled={isSubmitting}
                          type="text"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={uploadMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUploadMode("url");
                      removeSelectedFile();
                    }}
                    disabled={isSubmitting}
                  >
                    Use Image URL
                  </Button>
                  <span className="flex items-center text-xs font-semibold text-muted-foreground">
                    OR
                  </span>
                  <Button
                    type="button"
                    variant={uploadMode === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUploadMode("file");
                      form.setValue("profilePictureUrl", "");
                    }}
                    disabled={isSubmitting}
                  >
                    Upload Image
                  </Button>
                </div>

                {/* URL Mode Field */}
                {uploadMode === "url" && (
                  <FormField
                    control={form.control}
                    name="profilePictureUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            value={field.value ?? ""}
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
                    <FormLabel>Upload Profile Picture</FormLabel>
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
                {(uploadMode === "url" && form.watch("profilePictureUrl")) ||
                (uploadMode === "file" && previewUrl) ? (
                  <div className="flex justify-center pt-1">
                    <img
                      src={
                        uploadMode === "url"
                          ? form.watch("profilePictureUrl") || ""
                          : previewUrl!
                      }
                      alt="Preview"
                      className="size-32 rounded-full border border-border object-cover"
                    />
                  </div>
                ) : null}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full cursor-pointer rounded-lg bg-sky-500 font-semibold text-white hover:bg-sky-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {uploadMode === "url" ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    "Set Up Profile"
                  )}
                </Button>

                {isError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    Failed to set up profile. Please try again.
                  </div>
                )}

                {isSuccess && (
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                    Your profile had been set!
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
        <Button
          className="mx-auto mt-4 flex h-9 cursor-pointer rounded-lg bg-transparent px-4 font-semibold text-sky-500 shadow-none hover:bg-accent hover:text-sky-600 dark:hover:text-sky-400"
          onClick={() => navigate(`/userprofile/${username}`)}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}

export default SetProfile;
