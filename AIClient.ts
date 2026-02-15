/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoryState, StoryFull } from "./types";

export class AIClient {
  private static async retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) throw error;
      if (error.status >= 400 && error.status < 500 && error.status !== 429) throw error;
      console.warn(`API Call failed, retrying in ${delay}ms...`, error);
      await new Promise(res => setTimeout(res, delay));
      return this.retry(fn, retries - 1, delay * 2);
    }
  }

  static async streamStory(input: StoryState): Promise<StoryFull> {
    // Build system instruction and user prompt (same logic as before)
    let lengthConfig = "";
    if (input.mode === 'sleep') {
      const multiplier = input.storyLength === 'short' ? 0.7 : (input.storyLength === 'long' ? 1.5 : (input.storyLength === 'eternal' ? 2 : 1));
      const partsCount = Math.floor(15 * multiplier);
      const wordCountMin = Math.floor(4000 * multiplier);
      const wordCountMax = Math.floor(6000 * multiplier);
      lengthConfig = `
        - LENGTH: ULTIMATE SLUMBER EDITION.
        - WORD COUNT: ${wordCountMin}-${wordCountMax} words total.
        - PARTS: Exactly ${partsCount} distinct parts.
        - PACING: Hypnotically slow. Extensive descriptions.
        - INTERACTIVITY: NONE. The 'choices' array MUST be empty for all parts.
      `;
    } else {
      const settings: Record<string, string> = {
        short: "approx 400 words, 3-4 parts",
        medium: "approx 1200 words, 5-7 parts",
        long: "approx 2500 words, 8-10 parts",
        eternal: "approx 4500 words, 15-18 parts"
      };
      const setting = settings[input.storyLength] || settings.medium;
      lengthConfig = `
        - LENGTH: ${setting}.
        - INTERACTIVITY: Provide 3 meaningful, distinct choices at the end of each part (except the final part).
      `;
    }

    let systemInstruction = "";
    if (input.mode === 'sleep') {
      systemInstruction = `You are a master Sleep Hypnotist and Storyteller.
        Your goal is to induce deep sleep through a very long, boringly pleasant, and sensory-rich narrative.
        RULES:
        1. ZERO CONFLICT. No monsters, no scares, no sudden noises, no tension.
        2. TONE: Dreamy, lyrical, slow, and repetitive. Focus on warmth, softness, and safety.
        3. VOCABULARY: Soothing, rhythmic, sibilant sounds.
        ${lengthConfig}`;
    } else if (input.mode === 'classic') {
      systemInstruction = `You are a best-selling Children's Book Author (genre: Fantasy/Adventure).
        Your goal is to write an exciting, empowering story for kids aged 7-9.
        RULES:
        1. HEROIC TONE: Inspiring, brave, and wondrous.
        2. STRUCTURE: A clear beginning, middle, and end.
        3. VOCABULARY: Engaging but accessible, with one 'vocabWord' to learn.
        ${lengthConfig}`;
    } else {
      systemInstruction = `You are a Mad Libs Generator and Comedian.
        Your goal is to create a hilarious, chaotic, and nonsensical story using provided keywords.
        RULES:
        1. TONE: Silly, unexpected, high-energy.
        2. CONTENT: Maximum usage of the provided random words in funny contexts.
        ${lengthConfig}`;
    }

    let userPrompt = "";
    if (input.mode === 'sleep') {
      const { texture, sound, scent, theme } = input.sleepConfig;
      userPrompt = `Generate a sleep story with these parameters:
        HERO: ${input.heroName || 'The Dreamer'}.
        THEME: ${theme}.
        SENSORY ANCHORS: "${texture || 'softness'}", "${sound || 'quietness'}", "${scent || 'sweetness'}".`;
    } else if (input.mode === 'classic') {
      userPrompt = `Generate an adventure story:
        HERO: ${input.heroName || 'The Hero'}.
        POWER: ${input.heroPower || 'boundless imagination'}.
        SETTING: ${input.setting || 'a mysterious land'}.
        SIDEKICK: ${input.sidekick || 'none'}.
        PROBLEM: ${input.problem || 'a mystery to solve'}.`;
    } else {
      userPrompt = `Generate a Mad Libs story using these words:
        ${Object.entries(input.madlibs).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n')}`;
    }

    const storySchema = {
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

    return this.retry(async () => {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, userPrompt, responseSchema: storySchema }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error(err.error || 'Story generation failed'), { status: res.status });
      }
      const data = await res.json();
      let jsonStr = data.text || "{}";
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
      }
      const parsed = JSON.parse(jsonStr);
      if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length === 0) {
        throw new Error("Invalid story structure: 'parts' array is missing or empty.");
      }
      return parsed as StoryFull;
    });
  }

  static async generateAvatar(heroName: string, heroPower: string): Promise<string | null> {
    const prompt = `A professional children's book illustration portrait of ${heroName} who has the power of ${heroPower}. High-contrast, friendly, vibrant style. Close-up on the hero's face.`;
    return await this.retry(async () => {
      const res = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error(err.error || 'Avatar generation failed'), { status: res.status });
      }
      const data = await res.json();
      return `data:${data.mimeType};base64,${data.data}`;
    }, 2, 1000);
  }

  static async generateSceneIllustration(context: string, heroDescription: string): Promise<string | null> {
    const prompt = `Vibrant children's storybook scene: ${context.substring(0, 400)}. Featuring: ${heroDescription}. Whimsical, magical atmosphere.`;
    return await this.retry(async () => {
      const res = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error(err.error || 'Scene generation failed'), { status: res.status });
      }
      const data = await res.json();
      return `data:${data.mimeType};base64,${data.data}`;
    }, 2, 1000);
  }
}
