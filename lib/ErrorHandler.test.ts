/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { classifyApiError } from './ErrorHandler';

describe('classifyApiError', () => {
  describe('404 / missing API key', () => {
    it('returns empty message and shouldShowApiDialog=true when message includes "404"', () => {
      const result = classifyApiError({ message: 'Request failed with 404' }, 'avatar');
      expect(result.message).toBe('');
      expect(result.shouldShowApiDialog).toBe(true);
    });
  });

  describe('429 rate-limit', () => {
    it('includes the context name in the message', () => {
      const result = classifyApiError({ status: 429 }, 'story');
      expect(result.message).toContain('story');
      expect(result.shouldShowApiDialog).toBe(false);
    });

    it('instructs the user to wait 30 seconds', () => {
      const result = classifyApiError({ status: 429 }, 'scene');
      expect(result.message).toContain('30 seconds');
    });
  });

  describe('400 bad request', () => {
    it('includes the context name and "confused" in the message', () => {
      const result = classifyApiError({ status: 400 }, 'avatar');
      expect(result.message).toContain('avatar');
      expect(result.message).toContain('confused');
      expect(result.shouldShowApiDialog).toBe(false);
    });
  });

  describe('403 forbidden', () => {
    it('returns an access-denied message regardless of context', () => {
      const result = classifyApiError({ status: 403 }, 'story');
      expect(result.message).toContain('access denied');
      expect(result.shouldShowApiDialog).toBe(false);
    });
  });

  describe('5xx server errors', () => {
    it('returns a "temporarily down" message for 500', () => {
      const result = classifyApiError({ status: 500 }, 'scene');
      expect(result.message).toContain('temporarily down');
      expect(result.shouldShowApiDialog).toBe(false);
    });

    it('returns a "temporarily down" message for 503', () => {
      const result = classifyApiError({ status: 503 }, 'avatar');
      expect(result.message).toContain('temporarily down');
    });
  });

  describe('unknown / fallback errors', () => {
    it('falls back to a message containing the context and error message', () => {
      const result = classifyApiError({ message: 'Network timeout' }, 'story');
      expect(result.message).toContain('story');
      expect(result.message).toContain('Network timeout');
      expect(result.shouldShowApiDialog).toBe(false);
    });

    it('falls back gracefully when both status and message are absent', () => {
      const result = classifyApiError({}, 'scene');
      expect(result.message).toContain('scene');
      expect(result.message).toContain('Unknown error');
      expect(result.shouldShowApiDialog).toBe(false);
    });

    it('does not trigger the API dialog for a generic 422 status', () => {
      const result = classifyApiError({ status: 422, message: 'Unprocessable entity' }, 'avatar');
      expect(result.shouldShowApiDialog).toBe(false);
      expect(result.message).toContain('avatar');
    });
  });
});
