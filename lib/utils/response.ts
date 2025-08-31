import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types/api.types';

export class ApiResponseBuilder {
  static success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  }

  static error(
    message: string,
    code = 'UNKNOWN_ERROR',
    status = 400,
    details?: string
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
          details,
        },
      },
      { status }
    );
  }

  static unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 'FORBIDDEN', 403);
  }

  static notFound(message = 'Not found'): NextResponse<ApiResponse> {
    return this.error(message, 'NOT_FOUND', 404);
  }

  static serverError(
    message = 'Internal server error'
  ): NextResponse<ApiResponse> {
    return this.error(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}
