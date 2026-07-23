import { describe, expect, it } from 'vitest';

const GENERIC_FALLBACK = 'An unexpected error occurred.';

import {
  classifyNetworkError,
  extractApiErrorMessage,
  parseErrorBody,
} from './inferenceErrors';

// ---------------------------------------------------------------------------
// classifyNetworkError
// ---------------------------------------------------------------------------

describe('classifyNetworkError', () => {
  it('returns a friendly message for a TypeError (network failure)', () => {
    const err = new TypeError('Failed to fetch');
    expect(classifyNetworkError(err)).toBe(
      'Unable to reach the inference service. Check your network connection.'
    );
  });

  it('returns the error message for a generic Error', () => {
    const err = new Error('Something went wrong');
    expect(classifyNetworkError(err)).toBe('Something went wrong');
  });

  it('returns a generic fallback for non-Error values', () => {
    expect(classifyNetworkError('a string')).toBe(GENERIC_FALLBACK);
    expect(classifyNetworkError(null)).toBe(GENERIC_FALLBACK);
    expect(classifyNetworkError(42)).toBe(GENERIC_FALLBACK);
  });
});

// ---------------------------------------------------------------------------
// parseErrorBody
// ---------------------------------------------------------------------------

describe('parseErrorBody', () => {
  describe('null / non-object input', () => {
    it('returns null for null', () => {
      expect(parseErrorBody(null)).toBeNull();
    });

    it('returns null for a primitive value', () => {
      expect(parseErrorBody('string')).toBeNull();
      expect(parseErrorBody(42)).toBeNull();
    });

    it('returns null for an empty object', () => {
      expect(parseErrorBody({})).toBeNull();
    });
  });

  describe('pydantic 422 validation error shape', () => {
    it('formats a single validation error', () => {
      const body = {
        detail: [
          {
            loc: ['body', 'temperature'],
            msg: 'value is not a valid float',
            type: 'type_error.float',
          },
        ],
      };
      expect(parseErrorBody(body)).toBe(
        "'temperature': value is not a valid float"
      );
    });

    it('joins multiple validation errors with "; "', () => {
      const body = {
        detail: [
          {
            loc: ['body', 'temperature'],
            msg: 'too large',
            type: 'value_error',
          },
          {
            loc: ['body', 'max_tokens'],
            msg: 'must be positive',
            type: 'value_error',
          },
        ],
      };
      expect(parseErrorBody(body)).toBe(
        "'temperature': too large; 'max_tokens': must be positive"
      );
    });

    it('omits the field prefix when loc is empty', () => {
      const body = {
        detail: [{ loc: [], msg: 'invalid payload', type: 'value_error' }],
      };
      expect(parseErrorBody(body)).toBe('invalid payload');
    });

    it('strips the leading "body" segment from the field path', () => {
      const body = {
        detail: [
          {
            loc: ['body', 'messages', 0, 'content'],
            msg: 'too long',
            type: 'value_error',
          },
        ],
      };
      expect(parseErrorBody(body)).toBe("'messages.0.content': too long");
    });

    it('falls back to "Invalid value" when msg is missing', () => {
      const body = {
        detail: [{ loc: ['body', 'top_p'], type: 'value_error' }],
      };
      expect(parseErrorBody(body)).toBe("'top_p': Invalid value");
    });
  });

  describe('vLLM 400 error shape', () => {
    it('extracts the msg value from the embedded Python dict', () => {
      const body = {
        error: {
          message:
            "1 validation errors for CompletionRequest\n  {'loc': ('temperature',), 'msg': \"value must be a float\", 'type': 'type_error'}\n\n  File \"/app/vllm/server.py\", line 42",
          type: 'invalid_request_error',
          code: 400,
        },
      };
      expect(parseErrorBody(body)).toBe('value must be a float');
    });

    it('returns the full message (without traceback) when no msg key is present', () => {
      const body = {
        error: {
          message:
            'Parameter out of range\n\n  File "/app/vllm/server.py", line 5',
        },
      };
      expect(parseErrorBody(body)).toBe('Parameter out of range');
    });

    it('returns null when error.message is empty', () => {
      const body = { error: { message: '' } };
      expect(parseErrorBody(body)).toBeNull();
    });

    it('returns null when the message is only a traceback (withoutTraceback is empty)', () => {
      // The traceback starts at the very beginning of the message string;
      // split yields '' before the first \n\n  File ", which trims to ''.
      const body = {
        error: { message: '\n\n  File "/app/vllm/server.py", line 5' },
      };
      expect(parseErrorBody(body)).toBeNull();
    });

    it('returns null when error is not an object', () => {
      const body = { error: 'some plain string' };
      // Falls through to parseGenericError which reads b.error as a string
      expect(parseErrorBody(body)).toBe('some plain string');
    });
  });

  describe('generic error shape', () => {
    it('returns body.message when present', () => {
      expect(parseErrorBody({ message: 'Something failed' })).toBe(
        'Something failed'
      );
    });

    it('returns body.detail when message is absent', () => {
      expect(parseErrorBody({ detail: 'Not found' })).toBe('Not found');
    });

    it('returns body.error string when error is a string', () => {
      expect(parseErrorBody({ error: 'Unauthorized' })).toBe('Unauthorized');
    });

    it('returns null when none of the known fields are present', () => {
      expect(parseErrorBody({ foo: 'bar' })).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// extractApiErrorMessage
// ---------------------------------------------------------------------------

const makeResponse = (
  status: number,
  body: unknown,
  contentType = 'application/json'
): Response => {
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(bodyText, {
    headers: { 'content-type': contentType },
    status,
  });
};

describe('extractApiErrorMessage', () => {
  describe('parsed error body', () => {
    it('returns the parsed pydantic message when the body matches', async () => {
      const response = makeResponse(422, {
        detail: [
          {
            loc: ['body', 'model'],
            msg: 'field required',
            type: 'value_error.missing',
          },
        ],
      });
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        "'model': field required"
      );
    });

    it('returns the parsed generic message when the body matches', async () => {
      const response = makeResponse(400, { message: 'Bad request body' });
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Bad request body'
      );
    });
  });

  describe('status fallback when body is unrecognised or unparseable', () => {
    it('falls back for status 400', async () => {
      const response = makeResponse(400, { foo: 'bar' });
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Invalid request parameters.'
      );
    });

    it('falls back for status 401', async () => {
      const response = makeResponse(401, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'API key is invalid or expired.'
      );
    });

    it('falls back for status 403', async () => {
      const response = makeResponse(403, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Not authorized to use this model.'
      );
    });

    it('falls back for status 404', async () => {
      const response = makeResponse(404, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Model not found.'
      );
    });

    it('falls back for status 429', async () => {
      const response = makeResponse(429, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Rate limit exceeded \u2014 please wait before sending another message.'
      );
    });

    it('falls back for status 500', async () => {
      const response = makeResponse(500, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'The inference service is temporarily unavailable.'
      );
    });

    it('falls back for an unrecognised 4xx status', async () => {
      const response = makeResponse(418, {});
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'Request failed (HTTP 418).'
      );
    });

    it('falls back when the body is not valid JSON', async () => {
      const response = makeResponse(
        502,
        '<html>Bad Gateway</html>',
        'text/html'
      );
      await expect(extractApiErrorMessage(response)).resolves.toBe(
        'The inference service is temporarily unavailable.'
      );
    });
  });
});
