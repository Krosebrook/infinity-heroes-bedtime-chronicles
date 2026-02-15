import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { systemInstruction, userPrompt, responseSchema } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    res.status(200).json({ text: result.text });
  } catch (error: any) {
    console.error('Story generation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Generation failed' });
  }
}
