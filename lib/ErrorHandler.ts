/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Result of classifying an API error.
 */
export interface ApiErrorResult {
  /** User-facing error message, or empty string when the API-key dialog should be shown instead. */
  message: string;
  /** When true the caller should open the API key dialog. */
  shouldShowApiDialog: boolean;
}

/**
 * Classifies a failed API call into a user-friendly message and an optional
 * "show API-key dialog" flag.
 *
 * @param error - The caught error object (expected to have an optional `status`
 *   number and `message` string, as produced by AIClient).
 * @param context - Short label for the operation being performed (e.g.
 *   `'avatar'`, `'story'`, `'scene'`). Included in the returned message so the
 *   child understands what failed.
 * @returns An {@link ApiErrorResult} with a displayable message and a flag for
 *   whether the API-key dialog should be opened.
 */
export function classifyApiError(
  error: { status?: number; message?: string },
  context: string
): ApiErrorResult {
  const status = error.status;

  if (error.message?.includes('404')) {
    return { message: '', shouldShowApiDialog: true };
  }
  if (status === 429) {
    return {
      message: `The ${context} engine is busy. Please wait 30 seconds and try again.`,
      shouldShowApiDialog: false,
    };
  }
  if (status === 400) {
    return {
      message: `Something about your ${context} confused the AI. Try different inputs.`,
      shouldShowApiDialog: false,
    };
  }
  if (status === 403) {
    return {
      message: 'API access denied. Check your Gemini API key configuration.',
      shouldShowApiDialog: false,
    };
  }
  if (status !== undefined && status >= 500) {
    return {
      message: 'The AI service is temporarily down. Please try again later.',
      shouldShowApiDialog: false,
    };
  }

  return {
    message: `${context} Error: ${error.message || 'Unknown error'}`,
    shouldShowApiDialog: false,
  };
}
