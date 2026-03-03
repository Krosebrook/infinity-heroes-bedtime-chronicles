import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { withMiddleware, validateString } from './_middleware';

const STORY_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    parts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          text: { type: "STRING" },
          choices: { type: "ARRAY", items: { type: "STRING" } },
          partIndex: { type: "INTEGER" }
        },
        required: ["text", "partIndex"]
      }
    },
    vocabWord: {
      type: "OBJECT",
      properties: { word: { type: "STRING" }, definition: { type: "STRING" } },
      required: ["word", "definition"]
    },
    joke: { type: "STRING" },
    lesson: { type: "STRING" },
    tomorrowHook: { type: "STRING" },
    rewardBadge: {
      type: "OBJECT",
      properties: { emoji: { type: "STRING" }, title: { type: "STRING" }, description: { type: "STRING" } },
      required: ["emoji", "title", "description"]
    }
  },
  required: ["title", "parts", "vocabWord", "joke", "lesson", "tomorrowHook", "rewardBadge"]
};

export default withMiddleware(async (req: VercelRequest, res: VercelResponse) => {
  const systemInstruction = validateString(req.body.systemInstruction, 5000);
  const userPrompt = validateString(req.body.userPrompt, 2000);

  if (!systemInstruction || !userPrompt) {
    return res.status(400).json({ error: 'Invalid request parameters.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const result = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: STORY_SCHEMA,
    },
  });

  res.status(200).json({ text: result.text });
});
