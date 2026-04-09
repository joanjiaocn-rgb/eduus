export const runtime = 'edge';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Demo mode - accept without verification
    if (STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.log('Webhook received (demo mode):', payload);
      return Response.json({ received: true, demo: true });
    }

    // Verify webhook signature (simplified for Edge Runtime)
    // In production, use stripe-node library or implement proper signature verification
    
    // Parse the event
    const event = JSON.parse(payload);

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Payment successful:', event.data.object);
        // Here you would update your database
        break;
      
      case 'invoice.payment_succeeded':
        console.log('Subscription renewed:', event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return Response.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}