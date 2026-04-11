export const runtime = 'edge';
import { Buffer } from 'node:buffer';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function verifyWebhookSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  
  // Parse Stripe signature header
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];
  
  if (!timestamp || !sig) return false;
  
  // Check timestamp is within 5 minutes (300s)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false;
  }
  
  // Create signed payload
  const signedPayload = `${timestamp}.${payload}`;
  
  // Compute HMAC signature
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signatureBuffer = Buffer.from(sig, 'hex');
  const payloadBuffer = encoder.encode(signedPayload);
  
  return crypto.subtle.verify('HMAC', secretKey, signatureBuffer, payloadBuffer);
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Demo mode - accept without verification
    if (STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.log('Webhook received (demo mode):', payload);
      return Response.json({ received: true, demo: true });
    }

    // Verify webhook signature (production mode)
    if (STRIPE_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(payload, signature, STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
    }
    
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