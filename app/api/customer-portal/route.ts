export const runtime = 'edge';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();

    // Demo mode
    if (STRIPE_SECRET_KEY === 'sk_test_placeholder' || !customerId) {
      return Response.json({
        url: `${new URL(request.url).origin}/pricing`,
        demo: true,
      });
    }

    // Create Stripe Customer Portal session
    const params = new URLSearchParams({
      'customer': customerId,
      'return_url': `${new URL(request.url).origin}/`,
    });

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe portal error:', session);
      return Response.json({ error: session.error?.message || 'Portal error' }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}