import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { systemPrompt, userPrompt } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    // Debug: log key presence (not the key itself)
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) : 'N/A');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Key is missing from the environment variables.' },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid API Key format', details: 'Key should start with sk-' },
        { status: 500 }
      );
    }

    console.log('Making OpenAI API request...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4000,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error response:', errText);
      let err;
      try {
        err = JSON.parse(errText);
      } catch {
        err = { raw: errText };
      }
      return NextResponse.json(
        { error: 'OpenAI API error', status: response.status, details: err },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received, choices length:', data.choices?.length);
    
    let aiContent = data.choices[0].message.content;
    
    // Strip markdown code fences if present (often added by GPT)
    aiContent = aiContent.trim();
    if (aiContent.startsWith('```json')) {
      aiContent = aiContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (aiContent.startsWith('```')) {
      aiContent = aiContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let lessonPlan;
    try {
      lessonPlan = JSON.parse(aiContent);
    } catch (parseError: any) {
      console.error('JSON parse error. AI content:', aiContent.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', details: parseError.message, rawContent: aiContent.substring(0, 200) },
        { status: 500 }
      );
    }

    return NextResponse.json(lessonPlan);
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson plan.', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
