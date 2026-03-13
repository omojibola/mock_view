import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

const confidenceCheckinSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  attemptNumber: z.number().int().min(1, 'Attempt number is required'),
  statements: z.object({
    knewWhatToSay: z.number().int().min(1).max(5),
    feltUnjudged: z.number().int().min(1).max(5),
    realInterviewReadiness: z.number().int().min(1).max(5),
    recoveredWhenStuck: z.number().int().min(1).max(5),
  }),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const interviewId = request.nextUrl.searchParams.get('interviewId');
    const attemptNumber = Number(
      request.nextUrl.searchParams.get('attemptNumber') || ''
    );

    if (!interviewId || !attemptNumber) {
      return ApiResponseBuilder.error(
        'Interview ID and attempt number are required',
        'INVALID_REQUEST',
        400
      );
    }

    const { data, error } = await supabase
      .from('confidence_checkins')
      .select(
        `
        interview_id,
        attempt_number,
        knew_what_to_say,
        felt_unjudged,
        real_interview_readiness,
        recovered_when_stuck,
        self_belief_score,
        created_at
      `
      )
      .eq('user_id', user.id)
      .eq('interview_id', interviewId)
      .eq('attempt_number', attemptNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching confidence check-in:', error);
      return ApiResponseBuilder.error('Failed to fetch confidence check-in');
    }

    if (!data) {
      return ApiResponseBuilder.success(null);
    }

    return ApiResponseBuilder.success({
      interviewId: data.interview_id,
      attemptNumber: data.attempt_number,
      statements: {
        knewWhatToSay: data.knew_what_to_say,
        feltUnjudged: data.felt_unjudged,
        realInterviewReadiness: data.real_interview_readiness,
        recoveredWhenStuck: data.recovered_when_stuck,
      },
      selfBeliefScore: data.self_belief_score,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('Confidence check-in GET error:', error);
    return ApiResponseBuilder.error('Failed to fetch confidence check-in');
  }
}

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
    const validatedData = confidenceCheckinSchema.parse(body);

    const statements = validatedData.statements;
    const selfBeliefScore = Math.round(
      ((statements.knewWhatToSay +
        statements.feltUnjudged +
        statements.realInterviewReadiness +
        statements.recoveredWhenStuck) /
        4) *
        20
    );

    const { data, error } = await supabase
      .from('confidence_checkins')
      .upsert(
        {
          user_id: user.id,
          interview_id: validatedData.interviewId,
          attempt_number: validatedData.attemptNumber,
          knew_what_to_say: statements.knewWhatToSay,
          felt_unjudged: statements.feltUnjudged,
          real_interview_readiness: statements.realInterviewReadiness,
          recovered_when_stuck: statements.recoveredWhenStuck,
          self_belief_score: selfBeliefScore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,interview_id,attempt_number' }
      )
      .select(
        `
        interview_id,
        attempt_number,
        knew_what_to_say,
        felt_unjudged,
        real_interview_readiness,
        recovered_when_stuck,
        self_belief_score,
        created_at
      `
      )
      .single();

    if (error) {
      console.error('Error saving confidence check-in:', error);
      return ApiResponseBuilder.error('Failed to save confidence check-in');
    }

    return ApiResponseBuilder.success({
      interviewId: data.interview_id,
      attemptNumber: data.attempt_number,
      statements: {
        knewWhatToSay: data.knew_what_to_say,
        feltUnjudged: data.felt_unjudged,
        realInterviewReadiness: data.real_interview_readiness,
        recoveredWhenStuck: data.recovered_when_stuck,
      },
      selfBeliefScore: data.self_belief_score,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('Confidence check-in POST error:', error);

    if (error instanceof z.ZodError) {
      return ApiResponseBuilder.error(
        'Invalid confidence check-in data',
        'INVALID_REQUEST',
        400,
        error.message
      );
    }

    return ApiResponseBuilder.error('Failed to save confidence check-in');
  }
}
