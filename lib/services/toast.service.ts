import { toast } from 'sonner';
import { toastMessages } from '@/lib/config/toast.config';

class ToastService {
  success(message: string) {
    toast.success(message);
  }

  error(message: string) {
    toast.error(message);
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
  };
}

export const toastService = new ToastService();
export default toastService;
