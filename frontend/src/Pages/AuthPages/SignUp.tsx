import { useLoginMutation } from "@/auth/authApi";
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
import type { SignUpRequestDto } from "@/types/requestTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod/v3";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/auth/authSlice";

const signUpSchema = z.object({
  email: z.string().email(),
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpSchema = z.infer<typeof signUpSchema>;

function SignUp() {
  const [userSignUp, { isLoading: isSignUpLoading }] = useSignUpMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function handleSignUp(data: SignUpSchema) {
    setErrorMessage(null); // Clear previous errors

    try {
      const signUpRequest: SignUpRequestDto = {
        email: data.email,
        username: data.username,
        password: data.password,
      };

      // Sign up the user
      await userSignUp(signUpRequest).unwrap();

      // Automatically log them in
      const response = await login({
        username: signUpRequest.username,
        password: signUpRequest.password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          username: response.username,
          message: "You are logged in",
        })
      );

      navigate(`/userprofile/${response.username}/set-profile`);
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Handle different error types
      if (error?.status === 400 || error?.data) {
        // Backend returned an error message
        const message =
          typeof error.data === "string"
            ? error.data
            : error.data?.message || "Username or email already exists";
        setErrorMessage(message);
      } else if (error?.status === "FETCH_ERROR") {
        setErrorMessage("Cannot connect to server. Please try again later.");
      } else {
        setErrorMessage("An error occurred during sign up. Please try again.");
      }
    }
  }

  const isLoading = isSignUpLoading || isLoginLoading;

  // Show loading screen while logging in
  if (isLoginLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Logging you in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Top bar with toggle */}
        <div className="flex justify-end">
          <ModeToggle />
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-full p-2">
              <Camera className="h-10 w-10 text-purple-500" />
            </div>
          </div>
          <h1 className="text-4xl tracking-tight text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            <span className="font-[GreatVibes]">Social Media</span>
          </h1>
        </div>

        {/* Sign Up Form */}
        <Card className="w-full shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create New Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSignUp)}
                className="space-y-6"
              >
                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    <p className="text-sm">{errorMessage}</p>
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
                          disabled={isLoading}
                          className="py-5 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500"
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
                          disabled={isLoading}
                          className="py-5 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500"
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
                          className="py-5 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500"
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
                  className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-white"
                >
                  {isSignUpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : isLoginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
        <Card className="mt-6 border-0 bg-transparent shadow-none">
          <CardFooter className="flex flex-col gap-4">
            <div className="flex items-center justify-center w-full">
              <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
                OR
              </span>
              <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm">
                Already have an account?{" "}
                <span
                  className="text-blue-500 hover:underline cursor-pointer font-medium"
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
