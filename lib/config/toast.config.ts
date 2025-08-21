export const toastConfig = {
  position: 'bottom-right' as const,
  duration: 5000,
  closeButton: true,
  richColors: true,
  theme: 'dark' as const,
};

export const toastMessages = {
  auth: {
    emailConfirmation: 'Please check your email to confirm your account',
    loginSuccess: 'Welcome back!',
    registrationSuccess: 'Account created successfully!',
    logoutSuccess: 'Logged out successfully',
  },
  errors: {
    loginFailed: 'Login failed. Please check your credentials.',
    registrationFailed: 'Registration failed. Please try again.',
    unexpectedError: 'An unexpected error occurred',
  },
} as const;
