import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    // Fetch user interviews with interview data
    const { data: interviews, error } = await supabase
      .from('user_interviews')
      .select(
        `
        id,
        interview_kv_key,
        created_at,
        interviews_kv (
          value
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      return ApiResponseBuilder.error(
        'Failed to fetch interviews',
        'FETCH_ERROR',
        500
      );
    }

    // Check for feedback scores
    const interviewIds = interviews?.map((interview) => interview.id) || [];
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('interview_id, total_score')
      .in('interview_id', interviewIds);

    // Create feedback map for quick lookup
    const feedbackMap = new Map();
    feedbackData?.forEach((feedback) => {
      feedbackMap.set(feedback.interview_id, feedback.total_score);
    });
    // @ts-ignore
    const transformedInterviews =
      interviews?.map(
        (interview: {
          id: string;
          interviews_kv: any;
          created_at: string;
        }) => ({
          id: interview.id,
          title:
            interview.interviews_kv?.value.jobTitle || 'Untitled Interview',
          description:
            interview.interviews_kv?.value.jobDescription ||
            'No description available',
          duration: interview.interviews_kv?.value.duration || 30,
          type: interview.interviews_kv?.value?.type || '',
          completedAt: interview?.created_at,
          score: feedbackMap.get(interview.id) || undefined,
        })
      ) || [];

    return ApiResponseBuilder.success(transformedInterviews);
  } catch (error) {
    console.error('Error in interviews API:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}
