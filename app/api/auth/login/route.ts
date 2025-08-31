import type { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/utils/response';
import { loginSchema } from '@/lib/utils/validation';
import { createClient } from '@/utils/supabase/server';
import type { AuthResponse, User } from '@/lib/types/auth.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.error(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        validationResult.error.issues.toString()
      );
    }

    const { email, password } = validationResult.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return ApiResponseBuilder.error(
        error.message,
        'AUTHENTICATION_ERROR',
        401
      );
    }

    if (!data.user || !data.session) {
      return ApiResponseBuilder.error(
        'Authentication failed',
        'AUTHENTICATION_ERROR',
        401
      );
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      fullName: data.user.user_metadata?.full_name || data.user.email!,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
    };

    return ApiResponseBuilder.success<AuthResponse['data']>({
      user,
      session: {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponseBuilder.serverError('Failed to process login request');
  }
}
