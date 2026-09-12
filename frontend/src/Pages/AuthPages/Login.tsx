import { Camera, Loader2 } from 'lucide-react';
import { useLoginMutation } from '@/auth/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { z } from 'zod/v3';
import type { LoginRequest } from '@/types/requestTypes';
import { setCredentials } from '@/auth/authSlice';
import { ModeToggle } from '@/components/ModeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

// Built from `t` rather than declared at module scope, because the messages have to be
// resolved in the language that is active when validation runs, not when this file loads.
const buildLoginSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(6, t('auth.validation.usernameRequired')),
    password: z.string().min(6, t('auth.validation.passwordMin', { min: 6 })),
  });

type LoginSchema = z.infer<ReturnType<typeof buildLoginSchema>>;

function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // `t` changes identity when the language does, which rebuilds the schema.
  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

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
      form.setError('password', {
        type: 'manual',
        message: t('auth.login.failed'),
      });
      console.log('Error logging in: ', error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Top bar with toggles */}
        <div className="flex justify-end gap-2">
          <LanguageToggle />
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

        {/* Login Form */}
        <Card className="w-full shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('auth.login.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.fields.username')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.fields.usernamePlaceholder')}
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
                      <FormLabel>{t('auth.fields.password')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.fields.passwordPlaceholder')}
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('auth.login.submitting')}
                    </>
                  ) : (
                    t('auth.login.submit')
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
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">{t('common.or')}</span>
              <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-blue-500 hover:underline cursor-pointer">{t('auth.login.forgotPassword')}</p>
              <p className="text-sm">
                {t('auth.login.noAccount')}{' '}
                <span
                  className="text-blue-500 hover:underline cursor-pointer font-medium"
                  onClick={() => navigate('/signup')}
                >
                  {t('auth.login.signUpLink')}
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
