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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
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
    } catch (parseError) {
      console.error('JSON parse error. AI content:', aiContent.substring(0, 500));
      return Response.json(
        { error: 'Failed to parse AI response as JSON', details: 'The model returned non-JSON format. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(lessonPlan);
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    return Response.json(
      { error: 'Failed to generate lesson plan.', details: error.message },
      { status: 500 }
    );
  }
}
