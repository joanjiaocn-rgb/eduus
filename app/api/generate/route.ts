export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, userPrompt } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API Key is missing from the environment variables.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return Response.json(
        { error: 'OpenAI API error', details: err },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    const lessonPlan = JSON.parse(aiContent);

    return Response.json(lessonPlan);
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    return Response.json(
      { error: 'Failed to generate lesson plan.', details: error.message },
      { status: 500 }
    );
  }
}
