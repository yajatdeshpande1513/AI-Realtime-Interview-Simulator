import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { answer, question, type, emotion } = await req.json();

    const systemPrompt = `
      You are an expert AI Interview Behavioral Analyst.
      Analyze the candidate's response based on the following dimensions:
      1. STAR Structure Adherence (Situation, Task, Action, Result)
      2. Communication Quality (Clarity, Conciseness)
      3. Filler Word Density (Detection and rate)
      4. Confidence Indicators: Calculate a score (0-100). 
         - 80-100: Exceptional clarity, no filler words, assertive tone, positive/neutral emotion.
         - 60-80: Good professional delivery, occasional "um" or "like", steady emotion. (Standard target range)
         - 40-60: Noticeable hesitation, multiple filler words, or mismatch between tone and face.
         - Below 40: Significant stumbling, extreme filler density, or clear signs of distress/fear.
      5. Emotional Tone Alignment: The candidate's detected facial emotion is "${emotion || 'Neutral'}". 
         - "Neutral" and "Happy" should be considered normal/positive indicators for confidence.
         - "Fearful" or "Sad" should only lower the score by 15-20 points, not zero it out.
      ...
      8. Relevance Score (How directly the answer addresses the question)

      Return a JSON object ONLY with the following structure:
      {
        "scores": {
          "star": number (0-100),
          "communication": number (0-100),
          "confidence": number (0-100),
          "accuracy": number (0-100),
          "relevance": number (0-100)
        },
        "analysis": {
          "star_components": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean },
          "filler_words": string[],
          "tone": "Positive" | "Neutral" | "Negative",
          "feedback": string,
          "confidence_reasoning": string (Brief explanation of why the confidence score was given, mentioning specific linguistic or emotional cues)
        }
      }

      Question: ${question}
      Answer: ${answer}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
