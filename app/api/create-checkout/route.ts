export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { plan, billingCycle = 'monthly' } = await request.json();

    if (plan !== 'pro') {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Read env vars inside the function (Edge Runtime compatible)
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
    const STRIPE_PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY;

    if (!STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const priceId = billingCycle === 'yearly' ? STRIPE_PRICE_ID_YEARLY : STRIPE_PRICE_ID;

    // Create Stripe Checkout Session via direct API call (Edge Runtime compatible)
    const params = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId || '',
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
