import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, history, type = 'behavioral' } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "API Key missing." }, { status: 500 });
    }

    const systemPrompt = `
      You are a senior recruiter conducting a ${type} interview.
      Your goal is to evaluate the candidate's response and ask one insightful follow-up question.
      Keep your responses professional, concise (1-2 sentences), and encouraging.
      If it's a behavioral round, push for STAR (Situation, Task, Action, Result) details.
      If it's technical, verify depth of knowledge.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const responseText = chatCompletion.choices[0].message.content;

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error('Groq Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}