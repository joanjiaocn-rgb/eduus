export const runtime = 'edge';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Demo mode
    if (STRIPE_SECRET_KEY === 'sk_test_placeholder' || sessionId === 'demo_session') {
      return Response.json({
        status: 'active',
        plan: 'pro',
        customer: { email: 'demo@example.com' },
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        demo: true,
      });
    }

    // Fetch session from Stripe
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const session = await response.json();

    if (!response.ok) {
      return Response.json({ error: session.error?.message || 'Invalid session' }, { status: 400 });
    }

    return Response.json({
      status: session.status,
      plan: 'pro',
      customer: {
        email: session.customer_details?.email,
      },
      subscription: session.subscription,
    });
  } catch (err) {
    console.error('Session check error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}