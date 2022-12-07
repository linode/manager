import { LinodeStatus, ImageStatus } from '@linode/api-v4/types';
import { getImage } from '@linode/api-v4/lib/images';
import { getLinode } from '@linode/api-v4/lib/linodes';

/**
 * @file Utilities for polling APIs and other resources.
 */

export interface PollingOptions {
  // Poll label. Used for logging and error troubleshooting.
  label?: string;

  // Initial delay (in MS) before executing callback. Useful for operations
  // that are known to fail immediately.
  initialDelay: number;

  // Maximum polling attempts before failing.
  maxAttempts: number;

  // Fibonacci number offset. Useful for increasing the delays between attempts.
  fibonacciOffset: number;
}

const defaultPollingOptions = {
  label: undefined,
  initialDelay: 0,
  maxAttempts: 10,
  fibonacciOffset: 0,
};

/**
 * Get a fibonacci number with the given index.
 *
 * @param index - Index of fibonacci number to retrieve.
 *
 * @returns Fibonacci number for `index`.
 */
const fibonacci = (index: number): number => {
  if (index <= 1) {
    return 1;
  }
  return fibonacci(index - 1) + fibonacci(index - 2);
};

/**
 * Executes a callback repeatedly until a desired result is achieved.
 *
 * Fibonacci backoff is used to increase time between subsequent attempts in
 * order to avoid overloading remote resources.
 *
 * @param callback - Callback that returns a Promise to retrieve some data.
 * @param evaluator - Callback to evaluate whether the data matches some condition.
 * @param options - Polling options.
 *
 * @returns A Promise that resolves to the retrieved data upon successful evaluation.
 */
export const poll = async <T>(
  callback: () => Promise<T>,
  evaluator: (T) => boolean,
  options?: Partial<PollingOptions>
): Promise<T> => {
  const { label, maxAttempts, initialDelay, fibonacciOffset } = {
    ...defaultPollingOptions,
    ...options,
  };

  if (initialDelay) {
    await new Promise((resolve) => setTimeout(resolve, initialDelay));
  }

  let attempt = 1;

  // Disable ESLint rule because we do not want to parallelize the async
  // operations in this case.
  /* eslint-disable no-await-in-loop */
  while (attempt < maxAttempts + 1) {
    const result = await callback();
    if (evaluator(result)) {
      return result;
    }
    attempt++;
    const fibonacciNum = fibonacci(attempt + fibonacciOffset);
    const fibonacciMs = fibonacciNum * 1000;
    await new Promise((resolve) => setTimeout(resolve, fibonacciMs));
  }

  const errorMessage = label
    ? `Poll '${label}' failed after ${maxAttempts} attempt(s)`
    : `Poll failed after ${maxAttempts} attempt(s)`;

  throw new Error(errorMessage);
};

/**
 * Polls a Linode with the given ID until it has the given status.
 *
 * @param linodeId - ID of Linode whose status should be polled.
 * @param desiredStatus - Desired status of Linode that is being polled.
 * @param options - Polling options.
 *
 * @returns A Promise that resolves to the polled Linode's status.
 */
export const pollLinodeStatus = async (
  linodeId: number,
  desiredStatus: LinodeStatus,
  options?: Partial<PollingOptions>
) => {
  const resolvedOptions = {
    label: 'Linode Status',
    ...options,
  };

  const getLinodeStatus = async () => {
    const linode = await getLinode(linodeId);
    return linode.status;
  };

  const checkLinodeStatus = (status: LinodeStatus): boolean =>
    status === desiredStatus;

  return poll(getLinodeStatus, checkLinodeStatus, resolvedOptions);
};

/**
 * Polls an Image with the given ID until it has the given status.
 *
 * @param imageId - ID of Image whose status should be polled.
 * @param desiredStatus - Desired status of Image that is being polled.
 * @param options - Polling options.
 *
 * @returns A Promise that resolves to the polled Image's status.
 */
export const pollImageStatus = async (
  imageId: string,
  desiredStatus: ImageStatus,
  options?: Partial<PollingOptions>
) => {
  const resolvedOptions = {
    label: 'Image Status',
    ...options,
  };

  const getImageStatus = async () => {
    const image = await getImage(imageId);
    return image.status;
  };

  const checkImageStatus = (status: ImageStatus): boolean =>
    status === desiredStatus;

  return poll(getImageStatus, checkImageStatus, resolvedOptions);
};
