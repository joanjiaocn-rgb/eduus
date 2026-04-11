export const runtime = 'edge';

// Hardcode Stripe keys for Cloudflare Pages Edge Runtime
const STRIPE_SECRET_KEY = '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';
const STRIPE_PRICE_ID_MONTHLY = 'price_1TKvvN9mguiMhIsJzZvf5U78';
const STRIPE_PRICE_ID_YEARLY = 'price_1TKvvN9mguiMhIsJMvlrHtRk';

export async function POST(request: Request) {
  try {
    const { plan, billingCycle = 'monthly' } = await request.json();

    if (plan !== 'pro') {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const priceId = billingCycle === 'yearly' ? STRIPE_PRICE_ID_YEARLY : STRIPE_PRICE_ID_MONTHLY;

    // Create Stripe Checkout Session via direct API call (Edge Runtime compatible)
    const params = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${origin}/pricing`,
      'allow_promotion_codes': 'true',
      'billing_address_collection': 'auto',
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      return Response.json({ error: session.error?.message || 'Stripe error' }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
