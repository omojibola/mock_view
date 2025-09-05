import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

const feedbackSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  feedback: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const { data, error } = await supabase
      .from('users_feedback_and_ratings')
      .insert({
        user_id: user.id,
        user_email: user.email,
        interview_id: validatedData.interviewId,
        rating: validatedData.rating,
        feedback: validatedData.feedback || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return ApiResponseBuilder.error('Failed to save feedback');
    }

    return ApiResponseBuilder.success(data);
  } catch (error) {
    console.error('Feedback API error:', error);

    if (error instanceof z.ZodError) {
      return ApiResponseBuilder.error('Invalid input data', error.message, 400);
    }

    return ApiResponseBuilder.error('An unexpected error occurred');
  }
}
