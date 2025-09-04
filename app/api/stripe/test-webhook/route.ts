import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  // Skip signature verification for testing
  const { userId = '58b35c11-34ef-4a1d-88bc-9f946f3e3a1e', credits } =
    await req.json();

  console.log('=== TEST WEBHOOK ===');
  console.log('UserId:', userId);
  console.log('Credits:', credits);

  const supabase = await createClient();

  const { data: userCheck, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId as unknown as string)
    .single();

  console.log('User check:', userCheck, userError);

  if (userCheck) {
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: credits,
      p_source: 'test_webhook',
    });

    console.log('RPC result:', { data, error });
    return NextResponse.json({ success: true, data, error });
  }

  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
