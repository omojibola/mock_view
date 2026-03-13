import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';
import type {
  DashboardConfidencePoint,
  DashboardConfidenceSummary,
} from '@/lib/types/interview.types';

type FeedbackRow = {
  interview_id: string;
  total_score: number;
  created_at: string;
  interview_title: string | null;
  type: string | null;
  attempt_number: number | null;
  user_interviews?: {
    interviews_kv?: {
      value?: {
        duration?: number;
      };
    };
  } | null;
};

type CheckinRow = {
  interview_id: string;
  attempt_number: number;
  knew_what_to_say: number;
  felt_unjudged: number;
  real_interview_readiness: number;
  recovered_when_stuck: number;
  self_belief_score: number;
};

type SessionRow = {
  interview_id: string;
  started_at: string;
  first_response_seconds: number | null;
  ended_normally: boolean | null;
  user_message_count: number | null;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const rollingAverage = (scores: number[]) =>
  scores.length
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : 0;

const buildConsistency = (history: number[], currentScore: number) => {
  const baseline = history.length > 0 ? rollingAverage(history) : currentScore;
  return clamp(Math.round(100 - Math.abs(currentScore - baseline) * 2), 35, 100);
};

const buildChallengeScore = (type?: string | null, duration = 30) => {
  const typeWeight =
    {
      technical: 78,
      'problem-solving': 74,
      mixed: 72,
      'case-study': 70,
      situational: 64,
      behavioral: 60,
      'live-coding': 82,
    }[type || ''] ?? 58;

  const durationBoost = clamp(Math.round((duration - 30) / 3), 0, 18);
  return clamp(typeWeight + durationBoost, 40, 100);
};

const getMismatchInsight = (
  history: DashboardConfidencePoint[]
): { count: number; message: string | null } => {
  const mismatchSessions = history.filter(
    (item) =>
      item.selfBelief !== null && item.performance - (item.selfBelief || 0) >= 15
  );

  if (mismatchSessions.length >= 3) {
    return {
      count: mismatchSessions.length,
      message:
        'Your answers have outperformed your self-belief in several recent sessions. That gap is worth noticing, because your evidence is stronger than your inner rating suggests.',
    };
  }

  return {
    count: mismatchSessions.length,
    message: null,
  };
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

    const { data: feedbackRows, error } = await supabase
      .from('feedback')
      .select(
        `
        interview_id,
        total_score,
        created_at,
        interview_title,
        type,
        attempt_number,
        user_interviews (
          interviews_kv (
            value
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error fetching dashboard performance:', error);
      return ApiResponseBuilder.error(
        'Failed to fetch dashboard performance',
        'FETCH_ERROR',
        500
      );
    }

    const feedback = (feedbackRows || []) as FeedbackRow[];

    if (feedback.length === 0) {
      const emptyPayload: DashboardConfidenceSummary = {
        latestSession: null,
        history: [],
        averagePerformance: null,
        floorPerformance: null,
        ceilingPerformance: null,
        mismatchCount: 0,
        mismatchInsight: null,
      };

      return ApiResponseBuilder.success(emptyPayload);
    }

    const interviewIds = [...new Set(feedback.map((item) => item.interview_id))];

    const [{ data: checkinRows }, { data: sessionRows }] = await Promise.all([
      supabase
        .from('confidence_checkins')
        .select(
          `
          interview_id,
          attempt_number,
          knew_what_to_say,
          felt_unjudged,
          real_interview_readiness,
          recovered_when_stuck,
          self_belief_score
        `
        )
        .eq('user_id', user.id)
        .in('interview_id', interviewIds),
      supabase
        .from('interview_sessions')
        .select(
          `
          interview_id,
          started_at,
          first_response_seconds,
          ended_normally,
          user_message_count
        `
        )
        .eq('user_id', user.id)
        .in('interview_id', interviewIds)
        .order('started_at', { ascending: false }),
    ]);

    const checkinMap = new Map<string, CheckinRow>();
    ((checkinRows || []) as CheckinRow[]).forEach((row) => {
      checkinMap.set(`${row.interview_id}:${row.attempt_number}`, row);
    });

    const latestSessionMap = new Map<string, SessionRow>();
    ((sessionRows || []) as SessionRow[]).forEach((row) => {
      if (!latestSessionMap.has(row.interview_id)) {
        latestSessionMap.set(row.interview_id, row);
      }
    });

    const historyDesc = feedback.map((item, index, collection) => {
      const key = `${item.interview_id}:${item.attempt_number ?? index + 1}`;
      const checkin = checkinMap.get(key);
      const session = latestSessionMap.get(item.interview_id);
      const priorScores = collection
        .slice(index + 1)
        .map((entry) => entry.total_score)
        .slice(0, 3);
      const duration =
        item.user_interviews?.interviews_kv?.value?.duration ?? 30;

      return {
        id: key,
        label: '',
        title: item.interview_title || 'Interview session',
        date: item.created_at,
        performance: item.total_score,
        selfBelief: checkin?.self_belief_score ?? null,
        readiness:
          typeof session?.first_response_seconds === 'number'
            ? clamp(Math.round(100 - session.first_response_seconds * 6), 20, 100)
            : null,
        completion:
          typeof session?.ended_normally === 'boolean'
            ? session.ended_normally
              ? 100
              : 45
            : 100,
        consistency: buildConsistency(priorScores, item.total_score),
        challenge: buildChallengeScore(item.type, duration),
        type: item.type || undefined,
      };
    });

    const history = historyDesc
      .slice(0, 6)
      .reverse()
      .map((item, index) => ({
        ...item,
        label: `S${index + 1}`,
      })) as DashboardConfidencePoint[];

    const performanceScores = history.map((item) => item.performance);
    const mismatch = getMismatchInsight(history);

    const payload: DashboardConfidenceSummary = {
      latestSession: history[history.length - 1] || null,
      history,
      averagePerformance: Math.round(rollingAverage(performanceScores)),
      floorPerformance: Math.min(...performanceScores),
      ceilingPerformance: Math.max(...performanceScores),
      mismatchCount: mismatch.count,
      mismatchInsight: mismatch.message,
    };

    return ApiResponseBuilder.success(payload);
  } catch (error) {
    console.error('Error in dashboard performance API:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}
