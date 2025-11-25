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
import { Loader2, Undo, X, ImageIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useGetUserByUsernameQuery,
  useUpdateUserProfileWithUrlMutation,
  useUpdateUserProfileWithUploadMutation,
} from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import type { UpdateProfileRequestDto } from "@/types/requestTypes";
import { useEffect, useState, useRef } from "react";

const updateProfileSchema = z.object({
  bioText: z.string().nullable().optional(),
  profilePictureUrl: z.string().optional(),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
type UploadMode = "url" | "file";

function EditProfile() {
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
    } catch (error) {
      console.error("Update failed:", error);
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
    <div className="dark:bg-gray-800 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <Card className="w-full dark:bg-gray-900">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="text-xl font-bold">
                Update Profile
              </CardTitle>
              <div className="flex items-center justify-around gap-2">
                <Button onClick={() => navigate(`/userprofile/${username}`)}>
                  <Undo />
                  Back
                </Button>
                <ModeToggle />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdateProfile)}
                className="space-y-6"
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
                <div className="flex gap-2">
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
                    Image URL
                  </Button>
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
                    Upload File
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

                {/* Image Preview */}
                {(uploadMode === "url" && form.watch("profilePictureUrl")) ||
                (uploadMode === "file" && previewUrl) ? (
                  <div className="mt-2">
                    <img
                      src={
                        uploadMode === "url"
                          ? form.watch("profilePictureUrl") || ""
                          : previewUrl!
                      }
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                ) : null}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full dark:bg-gray-300 hover:cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadMode === "url" ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>

                {isError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Failed to update profile. Please try again.
                  </div>
                )}

                {isSuccess && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    Profile updated successfully!
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditProfile;
