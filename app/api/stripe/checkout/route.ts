import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { credits } = await req.json();
  const pricePerCredit = 250; // 250 cents = $2.50 per credit
  const amount = credits * pricePerCredit;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${credits} Interview Credits` },
          unit_amount: pricePerCredit,
        },
        quantity: credits,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits?status=cancelled`,
    metadata: {
      userId: user.id,
      credits: String(credits),
    },
  });

  return NextResponse.json({ id: session.id });
}
