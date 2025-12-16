import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';

export async function POST(req: Request) {
    try {
        const { history } = await req.json();

        const model = getModel('gemini-2.0-flash');

        const prompt = `
      You are an expert clinical AI monitoring voice biomarkers for mental health.
      Analyze the following 7-day trend of acoustic features:
      ${JSON.stringify(history, null, 2)}
      
      Look for known patterns of depression or anxiety, such as:
      - Decreasing pitch (flat affect).
      - Increasing pause duration (psychomotor retardation).
      - Slower articulation rate.
      
      Provide a "Clinical Insight" summary for the user. 
      If risk is increasing, suggest a gentle, proactive intervention (e.g., "I noticed you're speaking slower lately, let's try a breathing exercise").
      Keep it non-alarmist but informative.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysis = response.text();

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Trend Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
