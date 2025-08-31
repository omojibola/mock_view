'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/utils/validation';
import authService from '@/lib/services/auth.service';
import toastService from '@/lib/services/toast.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);

      if (response.success) {
        toastService.auth.passwordResetSent();
        form.reset();
      } else {
        console.error('Forgot password failed:', response.error);
        form.setError('root', {
          message: response.error || 'Failed to send reset email',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      form.setError('root', {
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-cyan-400 mb-2'>
          Reset Password
        </h2>
        <p className='text-gray-400'>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {form.formState.errors.root && (
          <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-3'>
            <p className='text-red-400 text-sm'>
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor='email' className='text-white mb-2 block'>
            Email Address
          </Label>
          <Input
            id='email'
            type='email'
            {...form.register('email')}
            className='bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 h-12'
            placeholder='your@email.com'
          />
          {form.formState.errors.email && (
            <p className='text-red-400 text-sm mt-1'>
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-white hover:bg-gray-100 text-black font-semibold h-12 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
              <span>Sending Reset Email...</span>
            </div>
          ) : (
            <span>Send Reset Email</span>
          )}
        </Button>
      </form>

      <div className='text-center'>
        <p className='text-gray-400'>
          Remember your password?{' '}
          <Link
            href='/auth'
            className='text-cyan-400 hover:text-cyan-300 font-medium transition-colors'
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
