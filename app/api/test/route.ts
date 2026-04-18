import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'API is working',
      env: {
        hasApiKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 10) : null,
        allEnvKeys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET') && !k.includes('TOKEN'))
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
