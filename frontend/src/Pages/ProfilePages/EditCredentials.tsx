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
import type { UpdateCredentialsRequestDto } from "@/types/request-types";
import {
  useGetUserByUsernameQuery,
  useUpdateUserCredentialsMutation,
} from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";

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
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="w-full gap-6 rounded-xl border-border shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">
                Update Account Credentials
              </CardTitle>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  className="h-8 cursor-pointer rounded-lg border-0 bg-secondary px-3 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
                  onClick={() => navigate(`/userprofile/${username}`)}
                >
                  <Undo />
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdateCredentials)}
                className="space-y-5"
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
                  className="h-10 w-full cursor-pointer rounded-lg bg-sky-500 font-semibold text-white hover:bg-sky-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Credentials"
                  )}
                </Button>

                {isError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    Failed to update credentials. Please try again.
                  </div>
                )}

                {isSuccess && (
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
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
