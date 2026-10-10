import { useLoginMutation } from "@/api/auth/authApi";
import { useSignUpMutation } from "@/api/users/userApi";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { SignUpRequest } from "@/types/request-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod/v3";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/auth/authSlice";
import { applyServerErrors } from "@/utils/errors";

// Mirrors the constraints on the backend's SignUpRequest, so most mistakes are caught before a
// round trip. The backend still validates, and its field errors are mapped back onto these inputs.
const signUpSchema = z.object({
  email: z
    .string()
    .email("Email is not valid.")
    .max(254, "Email must be at most 254 characters."),
  username: z
    .string()
    .min(8, "Username must be between 8 and 20 characters.")
    .max(20, "Username must be between 8 and 20 characters.")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots, and underscores.",
    ),
  password: z
    .string()
    .min(8, "Password must be between 8 and 20 characters.")
    .max(20, "Password must be between 8 and 20 characters."),
});

type SignUpSchema = z.infer<typeof signUpSchema>;

function SignUp() {
  const [userSignUp, { isLoading: isSignUpLoading }] = useSignUpMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const isLoading = isSignUpLoading || isLoginLoading;
  const isDisabledButton = !form.formState.isValid || isLoading;
  const serverError = form.formState.errors.root?.server;

  async function handleSignUp(data: SignUpSchema) {
    // Step 1: Define the request
    const signUpRequest: SignUpRequest = {
      email: data.email,
      username: data.username,
      password: data.password,
    };

    // Step 2: Sign up the user
    try {
      await userSignUp(signUpRequest).unwrap();
    } catch (error) {
      console.error("Sign up error:", error);
      // Step 3: Map the errors back onto the form
      applyServerErrors(error, form, Object.keys(signUpSchema.shape));
      return;
    }

    // Step 4: Auto log them in
    try {
      const response = await login({
        username: signUpRequest.username,
        password: signUpRequest.password,
      }).unwrap();

      // Step 5: dispatch credentials
      dispatch(
        setCredentials({
          token: response.token,
          username: response.username,
        }),
      );

      navigate(`/userprofile/${response.username}/set-profile`);
    } catch (error) {
      console.error("Auto login after sign up failed:", error);
      // Typed so the banner can offer a way forward instead of only reporting the failure.
      form.setError("root.server", {
        type: "accountCreated",
        message:
          "Your account was created, but we could not sign you in automatically. Please log in.",
      });
    }
  }

  // Show loading screen while logging in
  if (isLoginLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Logging you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-3">
        {/* Top bar with theme toggle */}
        <div className="fixed right-4 top-4 z-10 rounded-full border border-border bg-secondary">
          <ModeToggle />
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 pb-4">
          <div className="rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-background p-2.5">
              <Camera className="size-8 text-foreground" />
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text px-2 pb-1 text-center text-5xl leading-tight text-transparent">
            <span className="font-['Great_Vibes']">Social Media</span>
          </h1>
        </div>

        {/* Sign Up Form */}
        <Card className="w-full gap-6 rounded-lg border-border py-8 shadow-none">
          <CardHeader className="px-6 sm:px-10">
            <CardTitle className="text-center text-base font-semibold text-muted-foreground">
              Create New Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSignUp)}
                className="space-y-4"
              >
                {/* Error Message */}
                {serverError && (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive"
                  >
                    <p className="text-sm leading-snug">
                      {serverError.message}
                    </p>
                    {serverError.type === "accountCreated" && (
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-1.5 rounded-sm text-sm font-semibold underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        Go to sign in
                      </button>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Email"
                          {...field}
                          onBlur={() => {
                            if (field.value) field.onBlur();
                          }}
                          disabled={isLoading}
                          className="h-10 rounded-md bg-muted/40 px-3 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          onBlur={() => {
                            if (field.value) field.onBlur();
                          }}
                          disabled={isLoading}
                          className="h-10 rounded-md bg-muted/40 px-3 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          {...field}
                          onBlur={() => {
                            if (field.value) field.onBlur();
                          }}
                          disabled={isLoading}
                          type="password"
                          className="h-10 rounded-md bg-muted/40 px-3 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isDisabledButton}
                  className="h-10 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white hover:bg-sky-600 focus-visible:ring-sky-500/40 disabled:opacity-60"
                >
                  {isSignUpLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : isLoginLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <Card className="gap-0 border-0 bg-transparent py-2 shadow-none">
          <CardFooter className="flex flex-col gap-5 px-6 sm:px-10">
            <div className="flex items-center justify-center w-full">
              <div className="flex-grow border-t border-border"></div>
              <span className="px-4 text-xs font-semibold tracking-wider text-muted-foreground">
                OR
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <span
                  className="cursor-pointer font-semibold text-sky-500 hover:underline"
                  onClick={() => navigate("/")}
                >
                  Sign in
                </span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default SignUp;
