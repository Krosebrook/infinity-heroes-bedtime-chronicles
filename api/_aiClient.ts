/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Creates and returns a configured {@link GoogleGenAI} client using the
 * `GEMINI_API_KEY` environment variable.
 *
 * @returns A ready-to-use {@link GoogleGenAI} instance.
 * @throws {Error} If `GEMINI_API_KEY` is not set in the environment.
 */
export function createAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({ apiKey });
}
