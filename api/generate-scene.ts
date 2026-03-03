/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { withMiddleware, validateString } from './_middleware';

export default withMiddleware(async (req: VercelRequest, res: VercelResponse) => {
  const prompt = validateString(req.body.prompt, 1000);

  if (!prompt) {
    return res.status(400).json({ error: 'Invalid request parameters.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });

  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (!part?.inlineData) {
    throw new Error('No image data received');
  }

  res.status(200).json({
    mimeType: part.inlineData.mimeType,
    data: part.inlineData.data,
  });
});
