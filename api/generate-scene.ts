/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

/**
 * Generate Scene API Endpoint
 * 
 * Generates scene illustrations for story parts using Google Gemini.
 * 
 * @param req - Vercel request object
 * @param req.body.prompt - Scene description from story part
 * @param res - Vercel response object
 * 
 * @returns {Promise<void>} JSON response with base64 image data or error
 * 
 * @example
 * POST /api/generate-scene
 * {
 *   "prompt": "A magical forest with glowing trees..."
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

  try {
    const { prompt } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (!part?.inlineData) {
      return res.status(500).json({ error: 'No image data received' });
    }

    res.status(200).json({
      mimeType: part.inlineData.mimeType,
      data: part.inlineData.data,
    });
  } catch (error: any) {
    console.error('Scene generation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Generation failed' });
  }
}
