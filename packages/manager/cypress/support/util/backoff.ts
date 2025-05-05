/**
 * @file Utilities to handle retries with configurable backoff logic.
 */

/**
 * Promise that waits a given number of milliseconds before resolving.
 *
 * @param timeout - Timeout in milliseconds.
 *
 * @returns Promise that resolves when timeout has passed.
 */
export const timeout = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

// Util to calculate fibonacci number for a given index.
const fibonacci = (index: number): number => {
  if (index <= 1) {
    return 1;
  }
  return fibonacci(index - 1) + fibonacci(index - 2);
};

/**
 * Options that apply to all backoff method implementations.
 */
export interface BackoffOptions {
  /** Length of time to wait (in milliseconds) before making first attempt. */
  initialDelay: number;

  /** Maximum number of attempts to make before rejecting with an error. */
  maxAttempts: number;
}

/**
 * Default backoff method options.
 */
export const defaultBackoffOptions: BackoffOptions = {
  initialDelay: 0,
  maxAttempts: 10,
};

/**
 * Attempts to resolve a Promise using a given backoff method to limit and delay attempts.
 *
 * @param backoffMethod - Backoff method to use to calculate delay between attempts.
 * @param promiseCallback - Callback to generate Promise to attempt to resolve.
 *
 * @returns Promise that resolves when `promiseCallback` Promise succeeds, or rejects after a given number of attempts.
 */
export const attemptWithBackoff = async <T>(
  backoffMethod: BackoffMethod,
  promiseCallback: () => Promise<T>
): Promise<T> => {
  const { initialDelay, maxAttempts } = backoffMethod.options;
  const attemptErrors: unknown[] = [];

  if (initialDelay) {
    await timeout(initialDelay);
  }

  // Disable ESLint rule because we do not want to parallelize the async operations.
  /* eslint-disable no-await-in-loop */
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const nextAttempt = attempt + 1;
    try {
      return await promiseCallback();
    } catch (e: unknown) {
      attemptErrors.push(e);
      if (nextAttempt <= maxAttempts) {
        const backoffTime = backoffMethod.calculateBackoff(nextAttempt);
        await timeout(backoffTime);
      }
    }
  }

  const errorMessage = attemptErrors.reduce(
    (acc: string, cur: unknown, index: number): string => {
      return `${acc}\n\nAttempt #${index + 1}:\n${cur}`;
    },
    `Failed to resolve promise after ${maxAttempts} attempt(s):`
  ) as string;
  throw new Error(errorMessage);
};

/**
 * Calculates backoff time when retrying an attempt to do something.
 */
export abstract class BackoffMethod {
  // / Backoff method options.
  public readonly options: BackoffOptions;

  /**
   * Constructor.
   *
   * @param options - Backoff method options.
   */
  constructor(options?: Partial<BackoffOptions> | undefined) {
    this.options = {
      ...defaultBackoffOptions,
      ...(options || {}),
    };
  }

  /**
   * Returns the amount of time to delay for the given attempt.
   *
   * @param attempt - Attempt number for which to calculate backoff delay.
   *
   * @returns Time (in milliseconds) to delay.
   */
  public abstract calculateBackoff(attempt: number): number;
}

/**
 * Calculates backoff time using a constant interval between attempts.
 */
export class SimpleBackoffMethod extends BackoffMethod {
  // / Delay between attempts (in milliseconds).
  public readonly timeout: number;

  /**
   * Constructor.
   *
   * @param timeout - Timeout between each attempt, milliseconds.
   * @param options - Backoff method options.
   */
  constructor(timeout: number, options?: Partial<BackoffOptions>) {
    super(options);
    this.timeout = timeout;
  }

  /**
   * Returns the same backoff timeout for every attempt.
   *
   * @returns Backoff timeout (in milliseconds) corresponding to the value of `timeout`.
   */
  public calculateBackoff(_attempt: number): number {
    return this.timeout;
  }
}

/**
 * Calculates backoff time using Fibonacci sequence.
 */
export class FibonacciBackoffMethod extends BackoffMethod {
  // / Optional maximum timeout, in milliseconds.
  public readonly maxTimeout: number | undefined;

  // / Fibonacci starting index.
  public readonly offset: number;

  /**
   * Constructor.
   *
   * @param options - Backoff method options.
   * @param maxTimeout - Optional maximum backoff timeout (in milliseconds).
   * @param offset - Fibonacci starting index; useful for increasing delay between attempts.
   */
  constructor(
    options?: Partial<BackoffOptions>,
    maxTimeout: number | undefined = undefined,
    offset: number = 0
  ) {
    super(options);
    this.maxTimeout = maxTimeout;
    this.offset = offset;
  }

  /**
   * Returns backoff derived from Fibonacci sequence.
   *
   * @returns Backoff timeout (in milliseconds) from Fibonacci sequence.
   */
  public calculateBackoff(attempt: number): number {
    const fibonacciTimeout = fibonacci(attempt + this.offset) * 1000;
    return this.maxTimeout
      ? Math.min(fibonacciTimeout, this.maxTimeout)
      : fibonacciTimeout;
  }
}
