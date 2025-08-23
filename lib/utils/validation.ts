import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms of service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createInterviewSchema = z.object({
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters'),
  jobDescription: z
    .string()
    .min(1, 'Job description is required')
    .min(10, 'Job description must be at least 10 characters')
    .max(2000, 'Job description must be less than 2000 characters'),
  interviewType: z
    .enum([
      'technical',
      'behavioral',
      'problem-solving',
      'case-study',
      'situational',
      'live-coding',
    ])
    .refine(
      (val) =>
        [
          'technical',
          'behavioral',
          'problem-solving',
          'case-study',
          'situational',
          'live-coding',
        ].includes(val),
      { message: 'Please select a valid interview type' }
    ),
  experienceLevel: z
    .string()
    .min(1, 'Experience level is required')
    .refine(
      (val) =>
        ['entry-level', 'junior', 'mid-level', 'senior', 'lead'].includes(val),
      { message: 'Please select a valid experience level' }
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateInterviewFormData = z.infer<typeof createInterviewSchema>;
