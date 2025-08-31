'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/theme-context';
import authService from '@/lib/services/auth.service';
import toastService from '@/lib/services/toast.service';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const nameSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type NameFormData = z.infer<typeof nameSchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleNameUpdate = async (data: NameFormData) => {
    setIsUpdatingName(true);
    try {
      const result = await authService.updateProfile({
        fullName: data.fullName,
      });
      if (result.success) {
        toastService.success('Name updated successfully');
      } else {
        toastService.error(result.error || 'Failed to update name');
      }
    } catch (error) {
      console.log(error);
      toastService.error('An unexpected error occurred');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleEmailUpdate = async (data: EmailFormData) => {
    setIsUpdatingEmail(true);
    try {
      const result = await authService.updateEmail(data.email);
      if (result.success) {
        toastService.success(
          'Email update initiated. Please check your new email for confirmation.'
        );
      } else {
        toastService.error(result.error || 'Failed to update email');
      }
    } catch (error) {
      console.log(error);
      toastService.error('An unexpected error occurred');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const result = await authService.updatePassword(
        data.currentPassword,
        data.newPassword
      );
      if (result.success) {
        toastService.success('Password updated successfully');
        passwordForm.reset();
      } else {
        toastService.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toastService.error('An unexpected error occurred');
      console.log(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-4xl mx-auto space-y-8'>
          <div>
            <h1
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
            >
              Settings
            </h1>
            <p
              className={`text-sm mt-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Manage your account settings and preferences
            </p>
          </div>

          <div className='grid gap-6'>
            <Card
              className={
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  <User className='w-5 h-5' />
                  Profile Information
                </CardTitle>
                <CardDescription
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Name Update Form */}
                <form
                  onSubmit={nameForm.handleSubmit(handleNameUpdate)}
                  className='space-y-4'
                >
                  <div>
                    <Label
                      htmlFor='fullName'
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Full Name
                    </Label>
                    <Input
                      id='fullName'
                      {...nameForm.register('fullName')}
                      className={`mt-1 h-9 text-xs ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500'
                      }`}
                      placeholder='Enter your full name'
                    />
                    {nameForm.formState.errors.fullName && (
                      <p className='text-red-400 text-xs mt-1'>
                        {nameForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type='submit'
                    disabled={isUpdatingName || !nameForm.formState.isDirty}
                    size='sm'
                    className={`text-xs ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isUpdatingName ? 'Updating...' : 'Update Name'}
                  </Button>
                </form>

                <Separator
                  className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
                />

                {/* Email Update Form */}
                <form
                  onSubmit={emailForm.handleSubmit(handleEmailUpdate)}
                  className='space-y-4'
                >
                  <div>
                    <Label
                      htmlFor='email'
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Email Address
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      {...emailForm.register('email')}
                      className={`mt-1 h-9 text-xs ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500'
                      }`}
                      placeholder='Enter your email address'
                    />
                    {emailForm.formState.errors.email && (
                      <p className='text-red-400 text-xs mt-1'>
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type='submit'
                    disabled={isUpdatingEmail || !emailForm.formState.isDirty}
                    size='sm'
                    className={`text-xs ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card
              className={
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  <Lock className='w-5 h-5' />
                  Security
                </CardTitle>
                <CardDescription
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                  className='space-y-4'
                >
                  <div>
                    <Label
                      htmlFor='currentPassword'
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Current Password
                    </Label>
                    <div className='relative mt-1'>
                      <Input
                        id='currentPassword'
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...passwordForm.register('currentPassword')}
                        className={`h-9 pr-10 text-xs  ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400'
                            : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500'
                        }`}
                        placeholder='Enter current password'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className='text-red-400 text-xs mt-1'>
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor='newPassword'
                      className={`text-xs  font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      New Password
                    </Label>
                    <div className='relative mt-1'>
                      <Input
                        id='newPassword'
                        type={showNewPassword ? 'text' : 'password'}
                        {...passwordForm.register('newPassword')}
                        className={`h-9 pr-10 text-xs ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400'
                            : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500'
                        }`}
                        placeholder='Enter new password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {showNewPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className='text-red-400 text-xs mt-1'>
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor='confirmPassword'
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Confirm New Password
                    </Label>
                    <div className='relative mt-1'>
                      <Input
                        id='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...passwordForm.register('confirmPassword')}
                        className={`h-9 pr-10 text-xs ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400'
                            : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500'
                        }`}
                        placeholder='Confirm new password'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className='text-red-400 text-xs mt-1'>
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    disabled={isUpdatingPassword}
                    size='sm'
                    className={`text-xs ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
