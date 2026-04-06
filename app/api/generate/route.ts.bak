export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { topic, grade, standard } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
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
          {
            role: 'system',
            content: `You are an expert American K-12 curriculum designer. 
          You must output the lesson plan STRICTLY in Markdown format. 
          Use clear headings (##), bullet points, and bold text for maximum scannability. 
          Do not include conversational filler.
          
          Strictly follow this structure:
          ## 🎯 Lesson Objective (SWBAT)
          ## 📚 Standards Alignment
          ## 🧲 Hook / Do Now (5 mins)
          ## 👩‍🏫 Direct Instruction (I Do) (10-15 mins)
          ## 🤝 Guided Practice (We Do) (15 mins)
          ## ✍️ Independent Practice (You Do) (15 mins)
          ## 📝 Assessment / Exit Ticket (5 mins)
          ## 🌈 Differentiation Strategies (ELL & Special Needs)`,
          },
          {
            role: 'user',
            content: `Create a professional lesson plan for ${grade}. Topic: ${topic}. Standard: ${standard}.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json({ error: 'OpenAI API error' }, { status: 500 });
    }

    const data = await response.json();
    return Response.json({ result: data.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: 'Generation Failed' }, { status: 500 });
  }
}
