import { Camera, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/api/auth/authApi";
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
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import type { LoginRequest } from "@/types/request-types";
import { setCredentials } from "@/auth/authSlice";
import { ModeToggle } from "@/components/ModeToggle";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginSchema = z.infer<typeof loginSchema>;

function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [username, password] = form.watch(["username", "password"]);
  const isEmptyInput = !username.trim() || !password;
  const isDisabledButton = isEmptyInput || isLoading;

  async function handleFormSubmit(data: LoginSchema) {
    try {
      const loginRequest: LoginRequest = {
        username: data.username,
        password: data.password,
      };

      const response = await login(loginRequest).unwrap();
      dispatch(
        setCredentials({
          token: response.token,
          username: response.username,
        }),
      );
      navigate(`/home/${response.username}`);
    } catch (error) {
      // Set error field for login failure
      form.setError("password", {
        type: "manual",
        message: "Invalid username or password. Please try again.",
      });
      console.log("Error logging in: ", error);
    }
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

        {/* Login Form */}
        <Card className="w-full gap-6 rounded-lg border-border py-8 shadow-none">
          <CardHeader className="px-6 sm:px-10">
            <CardTitle className="text-center text-base font-semibold text-muted-foreground">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-4"
              >
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
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Log In"
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
              <p className="cursor-pointer text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
                Forgot Password?
              </p>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <span
                  className="cursor-pointer font-semibold text-sky-500 hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login;
