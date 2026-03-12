/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { withMiddleware, validateString } from './_middleware';

/**
 * Generate Story API Endpoint
 *
 * Generates AI-powered bedtime story content using Google Gemini.
 *
 * @param req - Vercel request object
 * @param req.body.systemInstruction - System prompt with safety rules and story guidelines
 * @param req.body.userPrompt - User's story parameters (hero, setting, mode, etc.)
 * @param res - Vercel response object
 *
 * @returns {Promise<void>} JSON response with generated story or error
 *
 * @example
 * POST /api/generate-story
 * {
 *   "systemInstruction": "You are a children's storyteller...",
 *   "userPrompt": "Write a story about..."
 * }
 *
 * Response:
 * {
 *   "text": "{\"title\": \"...\", \"parts\": [...]}"
 * }
 */
export default withMiddleware(async (req: VercelRequest, res: VercelResponse) => {
  const systemInstruction = validateString(req.body.systemInstruction, 5000);
  const userPrompt = validateString(req.body.userPrompt, 2000);

  if (!systemInstruction || !userPrompt) {
    return res.status(400).json({ error: 'Invalid request parameters.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  res.status(200).json({ text: result.text });
});
