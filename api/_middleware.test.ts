/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateString,
  validateStringEnum,
  sanitizeError,
  withMiddleware,
} from './_middleware';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// Helpers to build minimal Vercel request/response mocks
// ---------------------------------------------------------------------------

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: { 'content-length': '100', origin: 'http://localhost:3000' },
    body: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown = null;

  const res = {
    statusCode,
    setHeader: vi.fn((key: string, value: string) => {
      headers[key] = value;
    }),
    status: vi.fn((code: number) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data: unknown) => {
      body = data;
      return res;
    }),
    end: vi.fn(() => res),
    // Expose for assertions
    _headers: headers,
    _body: () => body,
    _status: () => statusCode,
  };
  return res as unknown as VercelResponse & {
    _headers: Record<string, string>;
    _body: () => unknown;
    _status: () => number;
  };
}

// ---------------------------------------------------------------------------
// validateString
// ---------------------------------------------------------------------------

describe('validateString', () => {
  it('should return the value when it is a string within the limit', () => {
    expect(validateString('hello', 100)).toBe('hello');
  });

  it('should truncate strings that exceed the max length', () => {
    expect(validateString('abcde', 3)).toBe('abc');
  });

  it('should return null for non-string values', () => {
    expect(validateString(42, 100)).toBeNull();
    expect(validateString(null, 100)).toBeNull();
    expect(validateString(undefined, 100)).toBeNull();
    expect(validateString({}, 100)).toBeNull();
  });

  it('should accept an empty string', () => {
    expect(validateString('', 100)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// validateStringEnum
// ---------------------------------------------------------------------------

describe('validateStringEnum', () => {
  const VOICES = ['Puck', 'Charon', 'Kore'] as const;
  type Voice = (typeof VOICES)[number];

  it('should return the value when it is in the allowed list', () => {
    expect(validateStringEnum<Voice>('Puck', [...VOICES])).toBe('Puck');
  });

  it('should return null when the value is not in the allowed list', () => {
    expect(validateStringEnum<Voice>('Unknown', [...VOICES])).toBeNull();
  });

  it('should return null for non-string values', () => {
    expect(validateStringEnum<Voice>(null, [...VOICES])).toBeNull();
    expect(validateStringEnum<Voice>(undefined, [...VOICES])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// sanitizeError
// ---------------------------------------------------------------------------

describe('sanitizeError', () => {
  it('should return status 500 and a generic message for unknown errors', () => {
    const result = sanitizeError(new Error('Internal DB failure'));
    expect(result.status).toBe(500);
    expect(result.message).toBe('An internal error occurred. Please try again.');
  });

  it('should pass through the known safe "No image data received" message', () => {
    const result = sanitizeError(new Error('No image data received'));
    expect(result.status).toBe(500);
    expect(result.message).toBe('No image data received');
  });

  it('should pass through the known safe "No audio data received" message', () => {
    const result = sanitizeError(new Error('No audio data received'));
    expect(result.status).toBe(500);
    expect(result.message).toBe('No audio data received');
  });

  it('should return status 500 for non-Error thrown values', () => {
    const result = sanitizeError('a plain string error');
    expect(result.status).toBe(500);
    expect(result.message).toBe('An internal error occurred. Please try again.');
  });
});

// ---------------------------------------------------------------------------
// withMiddleware
// ---------------------------------------------------------------------------

describe('withMiddleware', () => {
  beforeEach(() => {
    // Ensure GEMINI_API_KEY is set for handler tests
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.NODE_ENV = 'test';
  });

  it('should return 405 for non-POST requests', async () => {
    const handler = vi.fn();
    const wrapped = withMiddleware(handler);
    const req = makeReq({ method: 'GET' });
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(res._status()).toBe(405);
    expect((res._body() as { error: string }).error).toBe('Method not allowed');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call the handler for valid POST requests', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = withMiddleware(handler);
    const req = makeReq();
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should return 500 when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const handler = vi.fn();
    const wrapped = withMiddleware(handler);
    const req = makeReq();
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(res._status()).toBe(500);
    expect((res._body() as { error: string }).error).toBe('Service temporarily unavailable.');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 413 when content-length exceeds 50 000 bytes', async () => {
    const handler = vi.fn();
    const wrapped = withMiddleware(handler);
    const req = makeReq({ headers: { 'content-length': '60000' } });
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(res._status()).toBe(413);
    expect((res._body() as { error: string }).error).toMatch(/too large/i);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should respond 204 to CORS preflight OPTIONS requests', async () => {
    const handler = vi.fn();
    const wrapped = withMiddleware(handler);
    const req = makeReq({ method: 'OPTIONS', headers: { origin: 'http://localhost:3000' } });
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(res.end).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 429 after exceeding the rate limit', async () => {
    // Use a unique IP to avoid state pollution from other tests
    const ip = '10.0.99.99';
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = withMiddleware(handler);

    // Exhaust the 20-request window
    for (let i = 0; i < 20; i++) {
      const req = makeReq({
        headers: { 'x-forwarded-for': ip, 'content-length': '100' },
      });
      await wrapped(req, makeRes() as unknown as VercelResponse);
    }

    // The 21st request must be rate-limited
    const req = makeReq({
      headers: { 'x-forwarded-for': ip, 'content-length': '100' },
    });
    const res = makeRes();
    await wrapped(req, res as unknown as VercelResponse);

    expect(res._status()).toBe(429);
    expect((res._body() as { error: string }).error).toMatch(/too many requests/i);
  });

  it('should catch handler errors and return sanitized 500 response', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Unhandled boom'));
    const wrapped = withMiddleware(handler);
    const req = makeReq();
    const res = makeRes();

    await wrapped(req, res as unknown as VercelResponse);

    expect(res._status()).toBe(500);
    expect((res._body() as { error: string }).error).toBe(
      'An internal error occurred. Please try again.'
    );
  });
});
