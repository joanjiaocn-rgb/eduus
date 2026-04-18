export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'API is working',
    env: {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : null
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
