/**
 * Helpers for parsing and formatting error responses from the vLLM inference
 * API. Kept separate from inferenceService.ts so the fetch layer stays thin.
 */

/** Last-resort fallback when the response body cannot be parsed. */
const statusFallbackMessage = (status: number): string => {
  if (status === 400) return 'Invalid request parameters.';
  if (status === 401) return 'API key is invalid or expired.';
  if (status === 403) return 'Not authorized to use this model.';
  if (status === 404) return 'Model not found.';
  if (status === 429)
    return 'Rate limit exceeded — please wait before sending another message.';
  if (status >= 500) return 'The inference service is temporarily unavailable.';
  return `Request failed (HTTP ${status}).`;
};

// Each handler returns a string if it recognises the body shape, or null to
// signal that the next handler should be tried.

/**
 * Handles the pydantic 422 Validation Error shape:
 *   { detail: [{ loc: ["body", "field", ...], msg: "...", type: "..." }] }
 *
 * Formats each entry as "'fieldPath': msg" and joins them with "; ".
 */
const parsePydanticError = (b: Record<string, unknown>): null | string => {
  if (!Array.isArray(b.detail)) {
    return null;
  }
  const msgs = (
    b.detail as Array<{ loc?: Array<number | string>; msg?: string }>
  )
    .map((error) => {
      const fieldPath = (error.loc ?? []).slice(1).join('.');
      const msg = error.msg ?? 'Invalid value';
      return fieldPath ? `'${fieldPath}': ${msg}` : msg;
    })
    .join('; ');
  return msgs || null;
};

/**
 * Handles the vLLM 400 error shape (returned as a 200 by some gateways):
 *   { error: { message: "N validation errors:\n  {...Python dict...}\n\n  File ...", type, code } }
 *
 * Strips the Python traceback, then extracts the human-readable 'msg' value
 * from the embedded Python dict repr.
 *
 * TODO: If the backend is updated to return a proper 400, the traceback-stripping logic here may become unnecessary.
 */
const parseVllmError = (b: Record<string, unknown>): null | string => {
  const errorMessage = (b.error as Record<string, unknown> | undefined)
    ?.message;
  if (typeof errorMessage !== 'string' || !errorMessage) {
    return null;
  }

  // Strip the Python traceback (everything from the first blank line + "  File " onward).
  const withoutTraceback = errorMessage.split('\n\n  File "')[0].trim();
  if (!withoutTraceback) {
    return null;
  }
  // The embedded Python dict double-quotes values that contain single quotes,
  // so 'msg' always appears as: 'msg': "..."
  const match = withoutTraceback.match(/'msg':\s*"([^"]+)"/);
  return match?.[1] ?? withoutTraceback;
};

/**
 * Handles simple single-field error shapes returned by the gateway or proxy:
 *   { message: "..." } | { detail: "..." } | { error: "..." }
 */
const parseGenericError = (b: Record<string, unknown>): null | string => {
  const msg = b.message ?? b.detail ?? b.error;
  return typeof msg === 'string' && msg ? msg : null;
};

/**
 * Translates a caught fetch error into a user-facing message. `TypeError`
 * means fetch itself failed (network down, offline) — its native browser
 * message isn't suitable for display.
 */
export const classifyNetworkError = (err: unknown): string => {
  if (err instanceof TypeError) {
    return 'Unable to reach the inference service. Check your network connection.';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred.';
};

/**
 * Inspects an already-parsed response body and returns a human-readable error
 * message, or `null` if the body does not appear to contain an error.
 *
 * Tries each known vLLM/gateway error shape in order:
 *   1. Pydantic 422 → { detail: [{ loc, msg, ... }] }
 *   2. vLLM 400     → { error: { message: "…traceback…" } }
 *   3. Generic      → { message } | { detail } | { error }
 */
export const parseErrorBody = (body: unknown): null | string => {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const b = body as Record<string, unknown>;
  return parsePydanticError(b) ?? parseVllmError(b) ?? parseGenericError(b);
};

/**
 * Reads a non-OK (or unexpected) response body and returns a human-readable
 * error message. Falls back to the HTTP status description if the body cannot
 * be parsed as JSON or none of the known error shapes match.
 */
export const extractApiErrorMessage = async (
  response: Response
): Promise<string> => {
  try {
    const body = await response.json();
    const msg = parseErrorBody(body);
    if (msg) {
      return msg;
    }
  } catch {
    // non-JSON body (e.g. HTML error page from a proxy)
  }
  return statusFallbackMessage(response.status);
};
