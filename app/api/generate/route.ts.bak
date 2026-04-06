import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ... 前面代码保持不变
export async function POST(req: Request) {
  try {
    const { topic, grade, standard } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
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
          ## 🌈 Differentiation Strategies (ELL & Special Needs)`
        },
        {
          role: "user",
          content: `Create a professional lesson plan for ${grade}. Topic: ${topic}. Standard: ${standard}.`
        }
      ],
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Generation Failed' }, { status: 500 });
  }
}
