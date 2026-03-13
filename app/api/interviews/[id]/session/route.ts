import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: interviewId } = await context.params;
  const { callId } = await request.json();

  if (!callId) {
    return ApiResponseBuilder.error('Missing call ID');
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return ApiResponseBuilder.unauthorized('Authentication required');
  }
  try {
    const { error } = await supabase.from('interview_sessions').insert({
      interview_id: interviewId,
      started_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      vapi_call_id: callId,
    });

    if (error) {
      console.error('Error creating interview session:', error);
      return ApiResponseBuilder.error('Failed to create interview session');
    }
    return ApiResponseBuilder.success(
      { message: 'Interview session created', interviewId, callId },
      201
    );
  } catch (error) {
    console.log('Error creating interview session:', error);
    return ApiResponseBuilder.error('Failed to create interview session');
  }
}

const updateSessionSchema = z.object({
  endedNormally: z.boolean().optional(),
  endedReason: z.string().optional(),
  firstResponseSeconds: z.number().min(0).optional(),
  userMessageCount: z.number().int().min(0).optional(),
  pauseCount: z.number().int().min(0).optional(),
  attemptNumber: z.number().int().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: interviewId } = await context.params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return ApiResponseBuilder.unauthorized('Authentication required');
  }

  try {
    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    const payload: Record<string, string | number | boolean | null> = {};

    if (
      typeof validatedData.endedNormally !== 'undefined' ||
      typeof validatedData.endedReason !== 'undefined'
    ) {
      payload.completed_at = new Date().toISOString();
    }

    if (typeof validatedData.endedNormally !== 'undefined') {
      payload.ended_normally = validatedData.endedNormally;
    }

    if (typeof validatedData.endedReason !== 'undefined') {
      payload.ended_reason = validatedData.endedReason;
    }

    if (typeof validatedData.firstResponseSeconds !== 'undefined') {
      payload.first_response_seconds = validatedData.firstResponseSeconds;
    }

    if (typeof validatedData.userMessageCount !== 'undefined') {
      payload.user_message_count = validatedData.userMessageCount;
    }

    if (typeof validatedData.pauseCount !== 'undefined') {
      payload.pause_count = validatedData.pauseCount;
    }

    if (typeof validatedData.attemptNumber !== 'undefined') {
      payload.attempt_number = validatedData.attemptNumber;
    }

    const { data: latestSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('session_id')
      .eq('interview_id', interviewId)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !latestSession) {
      console.error('Failed to find interview session to update', sessionError);
      return ApiResponseBuilder.error('Interview session not found');
    }

    const { error } = await supabase
      .from('interview_sessions')
      .update(payload)
      .eq('session_id', latestSession.session_id);

    if (error) {
      console.error('Error updating interview session:', error);
      return ApiResponseBuilder.error('Failed to update interview session');
    }

    return ApiResponseBuilder.success({ message: 'Interview session updated' });
  } catch (error) {
    console.error('Error updating interview session:', error);
    return ApiResponseBuilder.error('Failed to update interview session');
  }
}
