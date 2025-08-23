'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '@/lib/utils/validation';
import authService from '@/lib/services/auth.service';
import toastService from '@/lib/services/toast.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const signUpForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const currentForm = isSignUp ? signUpForm : signInForm;

  const handleSignInSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      if (response.success && response.data) {
        router.push('/dashboard');
      } else {
        console.error('Login failed:', response.error);
        signInForm.setError('root', {
          message: response?.error?.message || 'Login failed',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      signInForm.setError('root', {
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);

      if (response.success && response.data) {
        if (response.data.session) {
          router.push('/dashboard');
        } else {
          toastService.auth.emailConfirmation();
          signUpForm.reset();
        }
      } else {
        console.error('Registration failed:', response.error);
        signUpForm.setError('root', {
          message: response?.error?.message || 'Registration failed',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      signUpForm.setError('root', {
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await authService.signInWithGoogle();

      if (!response.success) {
        console.error('Google sign-in failed:', response.error);
        signInForm.setError('root', {
          message: response?.error?.message || 'Google sign-in failed',
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      signInForm.setError('root', {
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    signInForm.reset();
    signUpForm.reset();
  };

  return (
    <div className='w-full max-w-md space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-cyan-400 mb-2'>
          {isSignUp ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-gray-400'>
          {isSignUp
            ? 'Start your interview practice journey'
            : 'Enter your credentials to access your account'}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={
          isSignUp
            ? signUpForm.handleSubmit(handleSignUpSubmit)
            : signInForm.handleSubmit(handleSignInSubmit)
        }
        className='space-y-6'
      >
        {(signInForm.formState.errors.root ||
          signUpForm.formState.errors.root) && (
          <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-3'>
            <p className='text-red-400 text-sm'>
              {signInForm.formState.errors.root?.message ||
                signUpForm.formState.errors.root?.message}
            </p>
          </div>
        )}

        {isSignUp && (
          <div>
            <Label htmlFor='fullName' className='text-white mb-2 block'>
              Full Name
            </Label>
            <Input
              id='fullName'
              type='text'
              {...signUpForm.register('fullName')}
              className='bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 h-12'
              placeholder='John Doe'
            />
            {signUpForm.formState.errors.fullName && (
              <p className='text-red-400 text-sm mt-1'>
                {signUpForm.formState.errors.fullName.message}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor='email' className='text-white mb-2 block'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            {...(isSignUp
              ? signUpForm.register('email')
              : signInForm.register('email'))}
            className='bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 h-12'
            placeholder='your@email.com'
          />
          {currentForm.formState.errors.email && (
            <p className='text-red-400 text-sm mt-1'>
              {currentForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='password' className='text-white mb-2 block'>
            Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              {...(isSignUp
                ? signUpForm.register('password')
                : signInForm.register('password'))}
              className='bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 h-12 pr-12'
              placeholder='••••••••'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
            >
              {showPassword ? (
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                  />
                </svg>
              ) : (
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
              )}
            </button>
          </div>
          {currentForm.formState.errors.password && (
            <p className='text-red-400 text-sm mt-1'>
              {currentForm.formState.errors.password.message}
            </p>
          )}
        </div>

        {isSignUp && (
          <div>
            <Label htmlFor='confirmPassword' className='text-white mb-2 block'>
              Confirm Password
            </Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                {...signUpForm.register('confirmPassword')}
                className='bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 h-12 pr-12'
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showConfirmPassword ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {signUpForm.formState.errors.confirmPassword && (
              <p className='text-red-400 text-sm mt-1'>
                {signUpForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        {!isSignUp && (
          <div className='flex items-center space-x-2'>
            <Controller
              name='rememberMe'
              control={signInForm.control}
              render={({ field }) => (
                <Checkbox
                  id='remember'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className='border-gray-600 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400'
                />
              )}
            />
            <Label htmlFor='remember' className='text-gray-300 text-sm'>
              Remember me
            </Label>
          </div>
        )}

        {isSignUp && (
          <div className='flex items-start space-x-2'>
            <Controller
              name='agreeToTerms'
              control={signUpForm.control}
              render={({ field }) => (
                <Checkbox
                  id='agreeToTerms'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className='border-gray-600 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400 mt-1'
                />
              )}
            />
            <Label
              htmlFor='agreeToTerms'
              className='text-gray-300 text-sm leading-relaxed'
            >
              I agree to the{' '}
              <Link
                href='/terms'
                className='text-cyan-400 hover:text-cyan-300 underline'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='text-cyan-400 hover:text-cyan-300 underline'
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
        )}
        {isSignUp && signUpForm.formState.errors.agreeToTerms && (
          <p className='text-red-400 text-sm'>
            {signUpForm.formState.errors.agreeToTerms.message}
          </p>
        )}

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-white hover:bg-gray-100 text-black font-semibold h-12 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
              <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
            </div>
          ) : (
            <span>{isSignUp ? 'Create Account' : 'Login'}</span>
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-700' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-black text-gray-400'>Or continue with</span>
        </div>
      </div>

      <Button
        type='button'
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        variant='outline'
        className='w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-white h-12 disabled:opacity-50'
      >
        <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
          <path
            fill='currentColor'
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          />
          <path
            fill='currentColor'
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          />
          <path
            fill='currentColor'
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          />
          <path
            fill='currentColor'
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          />
        </svg>
        Continue with Google
      </Button>

      <div className='text-center space-y-4'>
        <p className='text-gray-400'>
          {isSignUp ? 'Already have an account?' : 'Not a member?'}{' '}
          <button
            type='button'
            onClick={toggleMode}
            className='text-cyan-400 hover:text-cyan-300 font-medium transition-colors'
          >
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        {!isSignUp && (
          <Link
            href='/auth/forgot-password'
            className='text-gray-400 hover:text-cyan-400 text-sm transition-colors block'
          >
            Forgot your password?
          </Link>
        )}
      </div>
    </div>
  );
}
