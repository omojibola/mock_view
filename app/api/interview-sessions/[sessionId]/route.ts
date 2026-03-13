import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sessionId } = await context.params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('session_id, interview_id, attempt_number')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return ApiResponseBuilder.notFound('Interview session not found');
    }

    if (session.attempt_number !== null) {
      await supabase
        .from('confidence_checkins')
        .delete()
        .eq('user_id', user.id)
        .eq('interview_id', session.interview_id)
        .eq('attempt_number', session.attempt_number);

      await supabase
        .from('feedback')
        .delete()
        .eq('user_id', user.id)
        .eq('interview_id', session.interview_id)
        .eq('attempt_number', session.attempt_number);
    }

    const { error } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting interview session:', error);
      return ApiResponseBuilder.error('Failed to delete interview session');
    }

    return ApiResponseBuilder.success({ sessionId });
  } catch (error) {
    console.error('Error deleting interview session:', error);
    return ApiResponseBuilder.error('Failed to delete interview session');
  }
}
