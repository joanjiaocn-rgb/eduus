export const runtime = 'edge';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID || 'price_placeholder';
const STRIPE_PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY || 'price_yearly_placeholder';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51TKJB19mguiMhIsJn95c54WqV3hrmQ4pBvNm4Rai2PRER8yF1JPrqhH95FmBkxrnMHQ8OGaVNp46MGf007aUZVUK00K0pY7r6E';

export async function POST(request: Request) {
  try {
    const { plan, billingCycle = 'monthly' } = await request.json();

    if (plan !== 'pro') {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Debug: log what key we're using
    console.log('STRIPE_SECRET_KEY prefix:', STRIPE_SECRET_KEY.substring(0, 10));
    console.log('STRIPE_SECRET_KEY length:', STRIPE_SECRET_KEY.length);

    // If no real Stripe key configured, return demo mode response
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder' || STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.log('Demo mode: STRIPE_SECRET_KEY not configured or is test key');
      return Response.json({
        url: `${new URL(request.url).origin}/pricing/success?demo=true&session_id=demo_session`,
      });
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
