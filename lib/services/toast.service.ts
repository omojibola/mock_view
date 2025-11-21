import { toast } from 'sonner';
import { toastMessages } from '@/lib/config/toast.config';

class ToastService {
  success(message: string) {
    toast.success(message);
  }

  error(message: string, label?: string, onClick?: () => void) {
    toast.error(message, {
      action: {
        label: label,
        onClick: onClick || (() => {}),
      },
    });
  }

  info(message: string) {
    toast.info(message);
  }

  warning(message: string) {
    toast.warning(message);
  }

  // Predefined auth messages
  auth = {
    emailConfirmation: () => this.success(toastMessages.auth.emailConfirmation),
    loginSuccess: () => this.success(toastMessages.auth.loginSuccess),
    registrationSuccess: () =>
      this.success(toastMessages.auth.registrationSuccess),
    logoutSuccess: () => this.success(toastMessages.auth.logoutSuccess),
    loginFailed: () => this.error(toastMessages.errors.loginFailed),
    registrationFailed: () =>
      this.error(toastMessages.errors.registrationFailed),
    unexpectedError: () => this.error(toastMessages.errors.unexpectedError),
    passwordResetSent: () =>
      this.success(
        'Password reset email sent! Check your inbox for further instructions.'
      ),
    passwordResetSuccess: () =>
      this.success(
        'Password reset successfully! You can now sign in with your new password.'
      ),
  };
}

export const toastService = new ToastService();
export default toastService;
