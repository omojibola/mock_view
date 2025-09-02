import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const fullSession = await stripe.checkout.sessions.retrieve(session.id);
    const userId = fullSession.metadata?.userId;
    const credits = Number(fullSession.metadata?.credits || 0);

    if (userId && credits > 0) {
      const supabase = await createClient();
      const { error } = await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_source: 'stripe_payment',
      });

      if (error) {
        console.error('Error adding credits via webhook:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
