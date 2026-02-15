/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Generate Narration API Endpoint
 * 
 * Generates text-to-speech audio narration using Google Gemini TTS.
 * 
 * @param req - Vercel request object
 * @param req.body.text - Story text to convert to speech
 * @param req.body.voiceName - Narrator voice (Puck, Charon, Kore, Fenrir, Aoede, Zephyr, Leda)
 * @param res - Vercel response object
 * 
 * @returns {Promise<void>} JSON response with base64 audio data (PCM 24kHz) or error
 * 
 * @example
 * POST /api/generate-narration
 * {
 *   "text": "Once upon a time...",
 *   "voiceName": "Kore"
 * }
 * 
 * Response:
 * {
 *   "audioData": "base64_encoded_pcm_audio"
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { text, voiceName } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      return res.status(500).json({ error: 'No audio data received' });
    }

    res.status(200).json({ audioData });
  } catch (error: any) {
    console.error('Narration generation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Generation failed' });
  }
}
