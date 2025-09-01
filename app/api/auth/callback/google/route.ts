import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code from Google' }, { status: 400 });
  }

  const supabase = await createClient();

  // Exchange the Google code for a Supabase session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // At this point, Supabase has set the auth cookie automatically!
  return NextResponse.redirect('/dashboard');
}
