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
import type { UpdateCredentialsRequest } from "@/types/request-types";
import { useUpdateUserCredentialsMutation } from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { applyServerErrors } from "@/utils/errors";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/auth/authSlice";

// undefined, null and "" (what a cleared input gives) all mean "not filled in"
const isFilled = (value: string | null | undefined) => !!value?.trim();

// Field-by-field rules only. Kept as its own variable because .superRefine()
// wraps it in a ZodEffects, which has no .shape (applyServerErrors needs it).
// Every field starts as "" and "" means "leave unchanged", so each optional field
// accepts "" via .or(z.literal("")) and otherwise must pass the same rules as sign-up.
const baseCredentialsSchema = z.object({
  email: z
    .string()
    .email("Email is not valid.")
    .max(254, "Email must be at most 254 characters.")
    .or(z.literal("")),
  username: z
    .string()
    .min(8, "Username must be between 8 and 20 characters.")
    .max(20, "Username must be between 8 and 20 characters.")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots, and underscores.",
    )
    .or(z.literal("")),
  newPassword: z
    .string()
    .min(8, "Password must be between 8 and 20 characters.")
    .max(20, "Password must be between 8 and 20 characters.")
    .or(z.literal("")),
  confirmPassword: z.string(),
  // Only checked for presence: whether it's correct is the server's call
  oldPassword: z.string().min(1, "Current password is required"),
});

// Rules that look at several fields together
const updateCredentialsSchema = baseCredentialsSchema.superRefine(
  (data, ctx) => {
    // At least one change, or the request would do nothing
    if (
      !isFilled(data.email) &&
      !isFilled(data.username) &&
      !isFilled(data.newPassword)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        // Not a field: "root.*" becomes a form-level error (errors.root.noChanges)
        path: ["root", "noChanges"],
        message: "Change at least one: email, username, or password.",
      });
    }

    // A new password needs a matching confirmation
    if (isFilled(data.newPassword)) {
      if (!isFilled(data.confirmPassword)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "Please confirm your new password.",
        });
      } else if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "Passwords do not match.",
        });
      }
    }
  },
);

type UpdateCredentialsSchema = z.infer<typeof baseCredentialsSchema>;

function EditCredentials() {
  const navigate = useNavigate();
  const { loggedInUsername: username, loggedInUser: user } = useCurrentUser();

  const [updateUserCredentials, { isLoading, isSuccess }] =
    useUpdateUserCredentialsMutation();
  const dispatch = useDispatch();

  const form = useForm<UpdateCredentialsSchema>({
    resolver: zodResolver(updateCredentialsSchema),
    mode: "onTouched",
    // Empty on purpose: an empty field means "leave unchanged". The current values
    // show as placeholders instead, so they're never re-sent as a "change".
    defaultValues: {
      email: "",
      username: "",
      newPassword: "",
      confirmPassword: "",
      oldPassword: "",
    },
  });

  const serverError = form.formState.errors.root?.server;
  const noChangesError = form.formState.errors.root?.noChanges;

  async function handleUpdateCredentials(data: UpdateCredentialsSchema) {
    try {
      // Only send what the user filled in; undefined keys are left out of the JSON,
      // so the backend sees null and leaves that credential unchanged
      const updateRequest: {
        currentUsername: string;
      } & UpdateCredentialsRequest = {
        currentUsername: username!, // Current username for URL
        email: isFilled(data.email) ? data.email : undefined,
        username: isFilled(data.username) ? data.username : undefined,
        newPassword: isFilled(data.newPassword) ? data.newPassword : undefined,
        oldPassword: data.oldPassword,
      };

      const session = await updateUserCredentials(updateRequest).unwrap();

      // Swap in the new token and username (Redux and localStorage) before
      // navigating, so every request after this one is sent as the new user
      dispatch(setCredentials(session));

      toast.success("Credentials updated successfully!");

      // Reset form
      form.reset({
        email: "",
        username: "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      });

      navigate("/me");
    } catch (error) {
      console.error("Update credentials error:", error);
      // Field errors go under their inputs; anything else goes to the banner
      applyServerErrors(error, form, Object.keys(baseCredentialsSchema.shape));
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
                  onClick={() => navigate("/me")}
                >
                  <Undo />
                  Back
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Change your email, username, password, or any combination. Your
              current password is always required.
            </p>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            user?.email
                              ? `Current: ${user.email}`
                              : "Enter new email"
                          }
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
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            user?.username
                              ? `Current: ${user.username}`
                              : "Enter new username"
                          }
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
                      <FormLabel>New Password</FormLabel>
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

                {/* Form-level error: nothing to change */}
                {noChangesError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {noChangesError.message}
                  </div>
                )}

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

                {serverError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {serverError.message}
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
