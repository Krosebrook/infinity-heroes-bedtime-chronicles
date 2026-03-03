/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { withMiddleware, validateString } from './_middleware';

/**
 * Generate Avatar API Endpoint
 * 
 * Generates hero avatar images using Google Gemini image generation.
 * 
 * @param req - Vercel request object
 * @param req.body.prompt - Text description of hero appearance
 * @param res - Vercel response object
 * 
 * @returns {Promise<void>} JSON response with base64 image data or error
 * 
 * @example
 * POST /api/generate-avatar
 * {
 *   "prompt": "A friendly superhero with blue cape..."
 * }
 * 
 * Response:
 * {
 *   "mimeType": "image/png",
 *   "data": "base64_encoded_image_data"
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

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
