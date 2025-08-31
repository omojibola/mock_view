export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  credits?: number;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    session: AuthSession | null;
    message?: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
