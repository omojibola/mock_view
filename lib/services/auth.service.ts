import { createClient } from '@/utils/supabase/client';
import { appConfig } from '@/lib/config/app.config';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/lib/types/auth.types';

const supabase = createClient();

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'AUTHENTICATION_ERROR',
          },
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: {
            message: 'AUTHENTICATION FAILED',
            code: 'AUTHENTICATION_ERROR',
          },
        };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name || data.user.email!,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
        credits: data.user.user_metadata?.credits || 0,
      };

      return {
        success: true,
        data: {
          user,
          session: {
            user,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
          },
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'SERVER_ERROR',
        },
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            credits: 3,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: 'REGISTRATION_ERROR' },
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: { message: 'Registration failed', code: 'REGISTRATION_ERROR' },
        };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        fullName: userData.fullName,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
        credits: 3,
      };

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.user.email)
        .maybeSingle();

      if (existingUser) {
        return {
          success: false,
          error: {
            message: 'Email already exists',
            code: 'REGISTRATION_ERROR',
          },
        };
      }

      // If session exists (email confirmation disabled), return session data
      if (data.session) {
        return {
          success: true,
          data: {
            user,
            session: {
              user,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: new Date(
                data.session.expires_at! * 1000
              ).toISOString(),
            },
          },
        };
      }

      if (user) {
        const { error: dbError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          },
        ]);

        if (dbError) {
          console.error('Unable to save user', dbError);
        }
      }

      // If no session (email confirmation required), return success without session
      return {
        success: true,
        data: {
          user,
          session: null,
          message: 'Please check your email to confirm your account',
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'SERVER_ERROR',
        },
      };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return { success: false };
      }

      this.clearSession();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: User }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return { success: false };
      }

      const userData: User = {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email!,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
        credits: user.user_metadata?.credits || 0,
      };

      return { success: true, data: userData };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false };
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        return {
          success: false,
          error: {
            message: 'Failed to refresh session',
            code: 'SESSION_ERROR',
          },
        };
      }

      const user: User = {
        id: data.user!.id,
        email: data.user!.email!,
        fullName: data.user!.user_metadata?.full_name || data.user!.email!,
        createdAt: data.user!.created_at,
        updatedAt: data.user!.updated_at || data.user!.created_at,
        credits: data.user!.user_metadata?.credits || 0,
      };

      return {
        success: true,
        data: {
          user,
          session: {
            user,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
          },
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'SERVER_ERROR',
        },
      };
    }
  }

  getSession(): string | null {
    // Supabase handles session retrieval automatically
    // This method is kept for compatibility
    return null;
  }

  clearSession() {
    // Supabase handles session clearing via signOut
    // Additional cleanup if needed
    if (typeof window !== 'undefined') {
      localStorage.removeItem(appConfig.auth.sessionCookieName);
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` ||
            `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'OAUTH_ERROR',
          },
        };
      }

      return {
        success: true,
        data: undefined, // Will be handled by redirect
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'SERVER_ERROR',
        },
      };
    }
  }

  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  async resetPassword(
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  async updateProfile(data: {
    fullName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Unable to update profile',
      };
    }
  }

  async updateEmail(
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Update email error:', error);
      return {
        success: false,
        error: 'Unable to update email',
      };
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: (await this.getCurrentUser()).data?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }
}

const authService = new AuthService();

export { AuthService };
export default authService;
