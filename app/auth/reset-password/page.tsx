'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import authService from '@/lib/services/auth.service';
import { toastService } from '@/lib/services/toast.service';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/utils/validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function parseHash(hash: string) {
    const params = new URLSearchParams(
      hash.startsWith('#') ? hash.slice(1) : hash
    );
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      type: params.get('type'),
    };
  }

  const hashData = useMemo(
    () =>
      typeof window !== 'undefined' ? parseHash(window.location.hash) : {},
    []
  );

  useEffect(() => {
    const accessToken = (hashData as any).access_token;
    const refreshToken = (hashData as any).refresh_token;
    const type = (hashData as any).type;

    if (type === 'recovery' && accessToken && refreshToken) {
      setIsValidToken(true);
    } else {
      // Invalid or missing tokens, redirect to forgot password
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.resetPassword(data.password);

      if (response.success) {
        toastService.auth.passwordResetSuccess();
        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      } else {
        setError('root', {
          message:
            response.error || 'Failed to reset password. Please try again.',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('root', {
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-white mb-2'>
            Invalid Reset Link
          </h2>
          <p className='text-gray-400'>
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center px-8 py-12'>
      <div className='mx-auto w-full max-w-sm'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-white mb-2'>
            Reset Password
          </h1>
          <p className='text-gray-400'>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {errors.root && (
            <div className='text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3'>
              {errors.root.message}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='password' className='text-white'>
              New Password
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your new password'
                className='h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10'
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className='text-red-400 text-sm'>{errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword' className='text-white'>
              Confirm New Password
            </Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your new password'
                className='h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10'
                {...register('confirmPassword')}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='text-red-400 text-sm'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full h-12 bg-white text-black font-medium hover:bg-gray-100 transition-colors'
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => router.push('/auth')}
            className='text-cyan-400 hover:text-cyan-300 transition-colors text-sm'
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
