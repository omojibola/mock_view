import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';
import type { InterviewSessionListItem } from '@/lib/types/interview.types';

type SessionRow = {
  session_id: string;
  interview_id: string;
  created_at?: string;
  started_at: string | null;
  ended_normally: boolean | null;
  ended_reason: string | null;
  attempt_number: number | null;
  user_interviews?: {
    interviews_kv?: {
      value?: {
        jobTitle?: string;
        type?: string;
      };
    };
  } | null;
};

type FeedbackRow = {
  interview_id: string;
  attempt_number: number | null;
  total_score: number;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    const { data: sessionsData, error: sessionsError } = await supabase
      .from('interview_sessions')
      .select(
        `
        session_id,
        interview_id,
        created_at,
        started_at,
        ended_normally,
        ended_reason,
        attempt_number,
        user_interviews!inner (
          interviews_kv (
            value
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching interview sessions:', sessionsError);
      return ApiResponseBuilder.error('Failed to fetch interview sessions');
    }

    const sessions = (sessionsData || []) as SessionRow[];

    const interviewIds = [...new Set(sessions.map((session) => session.interview_id))];
    let feedbackData: FeedbackRow[] = [];

    if (interviewIds.length > 0) {
      const { data } = await supabase
        .from('feedback')
        .select('interview_id, attempt_number, total_score')
        .eq('user_id', user.id)
        .in('interview_id', interviewIds);

      feedbackData = (data || []) as FeedbackRow[];
    }

    const feedbackMap = new Map<string, number>();
    feedbackData.forEach((row) => {
      feedbackMap.set(`${row.interview_id}:${row.attempt_number ?? 0}`, row.total_score);
    });

    const payload: InterviewSessionListItem[] = sessions.map((session) => {
      const score =
        session.attempt_number !== null
          ? feedbackMap.get(`${session.interview_id}:${session.attempt_number}`) ??
            null
          : null;

      return {
        id: session.session_id,
        interviewId: session.interview_id,
        title:
          session.user_interviews?.interviews_kv?.value?.jobTitle ||
          'Interview session',
        score,
        completed: session.ended_normally === true,
        safeExited: session.ended_reason === 'safe_exit',
        createdAt: session.started_at || session.created_at || new Date().toISOString(),
        attemptNumber: session.attempt_number,
        type: session.user_interviews?.interviews_kv?.value?.type,
      };
    });

    return ApiResponseBuilder.success(payload);
  } catch (error) {
    console.error('Error fetching interview sessions:', error);
    return ApiResponseBuilder.error('Failed to fetch interview sessions');
  }
}
