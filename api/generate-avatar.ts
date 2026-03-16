/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withMiddleware, validateString } from './_middleware';
import { createAiClient } from './_aiClient';

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
export default withMiddleware(async (req: VercelRequest, res: VercelResponse) => {
  const prompt = validateString(req.body.prompt, 2000);

  if (!prompt) {
    return res.status(400).json({ error: 'Invalid request parameters.' });
  }

  const ai = createAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-preview-image-generation',
    contents: { parts: [{ text: prompt }] },
  });

  const part = response.candidates?.[0]?.content?.parts.find((p: { inlineData?: unknown }) => p.inlineData);
  if (!part?.inlineData) {
    throw new Error('No image data received');
  }

  res.status(200).json({
    mimeType: (part.inlineData as { mimeType: string; data: string }).mimeType,
    data: (part.inlineData as { mimeType: string; data: string }).data,
  });
});
