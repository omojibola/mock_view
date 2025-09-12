import type { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/utils/response';
import { createClient } from '@/utils/supabase/server';
import type {
  GeneratedInterview,
  InterviewQuestion,
} from '@/lib/types/interview.types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('User not authenticated');
    }

    const { data: userInterview, error: fetchError } = await supabase
      .from('user_interviews')
      .select(
        `
        *,
        interviews_kv (
          key,
          value
        )
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !userInterview) {
      return ApiResponseBuilder.error('Interview not found', 'NOT_FOUND', 404);
    }

    const kvData = userInterview.interviews_kv;
    if (!kvData || !kvData.value) {
      return ApiResponseBuilder.error('Interview Error', 'DATA_ERROR', 500);
    }

    const questions: InterviewQuestion[] = (
      kvData.value.questions as string[]
    ).map((questionText: string, index: number) => ({
      id: `${userInterview.id}-q${index + 1}`,
      question: questionText,
      category: kvData.value.type,
    }));

    const interview: GeneratedInterview = {
      id: userInterview.id,
      jobTitle: kvData.value.jobTitle,
      jobDescription: kvData.value.jobDescription,
      type: kvData.value.type,
      questions,
      createdAt: userInterview.created_at,
    };

    return ApiResponseBuilder.success(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'SERVER_ERROR',
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('User not authenticated');
    }

    const { data: userInterview, error: fetchError } = await supabase
      .from('user_interviews')
      .select('id, user_id, interview_kv_key')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !userInterview) {
      return ApiResponseBuilder.error('Interview not found', 'NOT_FOUND', 404);
    }

    const { error: feedbackDeleteError } = await supabase
      .from('feedback')
      .delete()
      .eq('interview_id', id);

    if (feedbackDeleteError) {
      console.error('Error deleting feedback:', feedbackDeleteError);
      return ApiResponseBuilder.error(
        'Failed to delete interview feedback',
        'DELETE_ERROR',
        500
      );
    }

    const { error: deleteError } = await supabase
      .from('user_interviews')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting interview:', deleteError);
      return ApiResponseBuilder.error(
        'Failed to delete interview',
        'DELETE_ERROR',
        500
      );
    }

    return ApiResponseBuilder.success({ deletedId: id });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'SERVER_ERROR',
      500
    );
  }
}
