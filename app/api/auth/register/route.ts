import type { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/utils/response';
import { registerSchema } from '@/lib/utils/validation';
import { createClient } from '@/utils/supabase/server';
import type { AuthResponse, User } from '@/lib/types/auth.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.error(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        validationResult.error.issues
      );
    }

    const { fullName, email, password } = validationResult.data;

    const supabase = await createClient();

    // 1. Sign up user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return ApiResponseBuilder.error(error.message, 'REGISTRATION_ERROR', 400);
    }

    if (!data.user) {
      return ApiResponseBuilder.error(
        'Registration failed',
        'REGISTRATION_ERROR',
        400
      );
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      fullName,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
    };

    // 2. Save user into your own `users` table
    const { error: dbError } = await supabase.from('users').insert([
      {
        id: user.id, // match Auth user id
        email: user.email,
        full_name: user.fullName,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    ]);

    if (dbError) {
      console.error('Unable to save user', dbError);
    }

    // 3. Build response
    if (data.session) {
      return ApiResponseBuilder.success<AuthResponse['data']>(
        {
          user,
          session: {
            user,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
          },
        },
        201
      );
    }

    return ApiResponseBuilder.success<AuthResponse['data']>(
      {
        user,
        session: null,
        message: 'Please check your email to confirm your account',
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return ApiResponseBuilder.serverError(
      'Failed to process registration request'
    );
  }
}
