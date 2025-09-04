import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!sig) {
      console.error('Missing Stripe signature');
      return new NextResponse('Missing Stripe signature', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse(
        `Webhook signature verification failed: ${err.message}`,
        {
          status: 400,
        }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        const fullSession = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        );

        const userId = fullSession.metadata?.userId;
        const credits = Number(fullSession.metadata?.credits || 0);

        if (!userId) {
          console.error('Missing userId in session metadata');
          return new NextResponse('Missing userId in session metadata', {
            status: 400,
          });
        }

        if (credits <= 0) {
          console.error('Invalid credits amount:', credits);
          return new NextResponse('Invalid credits amount', { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (userError || !user) {
          console.error('User not found or error:', userError);
          return new NextResponse('User not found', { status: 404 });
        }

        // Add credits using RPC function
        const { error: creditsError } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
          p_source: 'stripe_payment',
        });

        if (creditsError) {
          console.error('Error adding credits:', creditsError);
          return new NextResponse('Failed to add credits', { status: 500 });
        }
      } catch (error) {
        console.error('Error processing checkout session:', error);
        return new NextResponse('Error processing checkout session', {
          status: 500,
        });
      }
    }

    return NextResponse.json({
      received: true,
      eventType: event.type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
