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
import { Loader2, Undo } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useGetUserByUsernameQuery,
  useUpdateUserProfileMutation,
} from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { useEffect } from "react";
import type { UpdateProfileRequestDto } from "@/types/requestTypes";

const updateProfileSchema = z.object({
  bioText: z.string().min(0, "Bio is optional").nullable(),
  profilePictureUrl: z.string().min(8, "Image URL is required"),
});
type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

function EditProfile() {
  const { username } = useAuth();
  const [updateUserProfile, { isLoading, isError, isSuccess }] =
    useUpdateUserProfileMutation();
  const { data: user } = useGetUserByUsernameQuery(username!, {
    skip: !username,
  });
  const navigate = useNavigate();
  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bioText: user?.bioText,
      profilePictureUrl: user?.profilePictureUrl,
    },
  });

  async function handleUpdateProfile(data: UpdateProfileSchema) {
    try {
      const updateRequest: {
        username: string;
      } & UpdateProfileRequestDto = {
        username: username!,
        bioText: data.bioText ?? "",
        profilePictureUrl: data.profilePictureUrl,
      };

      await updateUserProfile(updateRequest).unwrap();

      // Reset form
      form.reset({
        bioText: "",
        profilePictureUrl: "",
      });

      navigate(`/userprofile/${username}`);
    } catch (error: any) {
      console.error("Update failed:", error);
    }
  }

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 1000);
    form.setValue(
      "profilePictureUrl",
      `https://picsum.photos/300/300?random=${randomNumber}`
    );
  }, [form]);

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
                {/* Email Field */}
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
                          disabled={isLoading}
                          type="text"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="profilePictureUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Upload Profile Picture"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Image Preview */}
                {form.watch("profilePictureUrl") && (
                  <div className="mt-2">
                    <img
                      src={form.watch("profilePictureUrl")}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full dark:bg-gray-300 hover:cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Credentials"
                  )}
                </Button>

                {isError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Failed to update credentials. Please try again.
                  </div>
                )}

                {isSuccess && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    Credentials updated successfully!
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
