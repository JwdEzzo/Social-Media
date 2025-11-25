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
import { toast } from "sonner"; // or use your preferred toast library
import { z } from "zod";
import type { UpdateCredentialsRequestDto } from "@/types/requestTypes";
import {
  useGetUserByUsernameQuery,
  useUpdateUserCredentialsMutation,
} from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";

const updateCredentialsSchema = z.object({
  email: z.string().email().nullable().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .nullable()
    .optional(),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nullable()
    .optional()
    .or(z.literal("")) // Allow empty string
    .or(z.null()), // Explicitly allow null
  confirmPassword: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("")) // Allow empty string
    .or(z.null()), // Explicitly allow null
  oldPassword: z.string().min(8, "Current password is required"),
});
type UpdateCredentialsSchema = z.infer<typeof updateCredentialsSchema>;

function EditCredentials() {
  const { username } = useAuth();
  const [updateUserCredentials, { isLoading, isError, isSuccess }] =
    useUpdateUserCredentialsMutation();
  const { data: user } = useGetUserByUsernameQuery(username!, {
    skip: !username,
  });
  const navigate = useNavigate();
  const form = useForm<UpdateCredentialsSchema>({
    resolver: zodResolver(updateCredentialsSchema),
    defaultValues: {
      email: user?.email,
      username: user?.username,
      newPassword: "",
      confirmPassword: "",
      oldPassword: "",
    },
  });

  async function handleUpdateCredentials(data: UpdateCredentialsSchema) {
    try {
      // Validate password match if both are provided
      if (
        data.newPassword &&
        data.confirmPassword &&
        data.newPassword !== data.confirmPassword
      ) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }

      // The mutation expects username in the object for URL construction
      const updateRequest: {
        currentUsername: string;
      } & UpdateCredentialsRequestDto = {
        currentUsername: username!, // Current username for URL
        email: data.email ?? "",
        username: data.username ?? "", // New username
        newPassword: data.newPassword ?? "",
        oldPassword: data.oldPassword,
      };

      await updateUserCredentials(updateRequest).unwrap();

      toast.success("Credentials updated successfully!");

      // Reset form
      form.reset({
        email: "",
        username: "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      });

      navigate(`/userprofile/${username}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Update credentials error:", error);
      let errorMessage = "Failed to update credentials";

      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status === 401) {
        errorMessage = "Current password is incorrect";
      } else if (error.status === 409) {
        errorMessage = "Username or email already exists";
      }

      toast.error(errorMessage);
    }
  }

  return (
    <div className="dark:bg-gray-800 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <Card className="w-full dark:bg-gray-900">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="text-xl font-bold">
                Update Account Credentials
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
                onSubmit={form.handleSubmit(handleUpdateCredentials)}
                className="space-y-6"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter new email"
                          {...field}
                          disabled={isLoading}
                          type="email"
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter new username"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter new password"
                          {...field}
                          disabled={isLoading}
                          type="password"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm new password"
                          {...field}
                          disabled={isLoading}
                          type="password"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Current Password Field (Required) */}
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Old Password (required)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your current password"
                          {...field}
                          disabled={isLoading}
                          type="password"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
export default EditCredentials;
