/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

/**
 * Generate Story API Endpoint
 * 
 * Generates AI-powered bedtime story content using Google Gemini.
 * 
 * @param req - Vercel request object
 * @param req.body.systemInstruction - System prompt with safety rules and story guidelines
 * @param req.body.userPrompt - User's story parameters (hero, setting, mode, etc.)
 * @param req.body.responseSchema - JSON schema for structured story output
 * @param res - Vercel response object
 * 
 * @returns {Promise<void>} JSON response with generated story or error
 * 
 * @example
 * POST /api/generate-story
 * {
 *   "systemInstruction": "You are a children's storyteller...",
 *   "userPrompt": "Write a story about...",
 *   "responseSchema": { type: "object", properties: {...} }
 * }
 * 
 * Response:
 * {
 *   "text": "{\"title\": \"...\", \"parts\": [...]}"
 * }
 */
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
