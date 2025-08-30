import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    const { data: credits, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (error) {
      return ApiResponseBuilder.error(
        'Failed to fetch credits',
        'FETCH_ERROR',
        500,
        error
      );
    }
    return ApiResponseBuilder.success(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return ApiResponseBuilder.error('Internal server error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    const { credits, source = 'manual_topup' } = await request.json();
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: credits,
      p_source: source,
    });

    if (error) {
      console.error('Add credits error:', error);
      return ApiResponseBuilder.error('Failed to add credits');
    }

    return ApiResponseBuilder.success({ credits: data });
  } catch (err) {
    console.error(err);
    return ApiResponseBuilder.error('Internal server error');
  }
}
