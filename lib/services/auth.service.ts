import { supabase } from '@/lib/config/supabase';
import { appConfig } from '@/lib/config/app.config';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/lib/types/auth.types';

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
      };

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

  setSession(session: string) {
    // Supabase handles session management automatically via cookies
    // This method is kept for compatibility but not needed with Supabase
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
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

      // OAuth redirect will handle the rest
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
}

const authService = new AuthService();

export { AuthService };
export default authService;
