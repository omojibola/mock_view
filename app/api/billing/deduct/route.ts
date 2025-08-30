import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }
    const { amount, interviewId } = await request.json();
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_interview_id: interviewId,
    });

    if (error) {
      if (error.message.includes('Insufficient credits')) {
        return ApiResponseBuilder.error(
          'Insufficient credits',
          'INSUFFICIENT',
          402
        );
      }
      console.error('Deduction error:', error);
      return ApiResponseBuilder.error('Failed to deduct credits');
    }

    return ApiResponseBuilder.success({ credits: data });
  } catch (err) {
    console.error(err);
    return ApiResponseBuilder.error('Internal server error');
  }
}
