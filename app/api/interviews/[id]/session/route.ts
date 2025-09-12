import type { NextRequest } from 'next/server';
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
