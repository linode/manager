/**
 * @file Utilities for polling APIs and other resources.
 */

import {
  BackoffOptions,
  BackoffMethod,
  FibonacciBackoffMethod,
  attemptWithBackoff,
} from './backoff';
import { LinodeStatus, ImageStatus, getImage, getLinode } from '@linode/api-v4';

/// Describes a backoff configuration for a poll. This may be a partial BackoffOptions object,
/// an instance of a BackoffMethod implementation, or undefined.
export type PollBackoffConfiguration =
  | Partial<BackoffOptions>
  | BackoffMethod
  | undefined;

// Default backoff options for a poll.
const defaultBackoffOptions: BackoffOptions = {
  maxAttempts: 10,
  initialDelay: 0,
};

// Default backoff method for a poll, which uses the default backoff options.
const defaultBackoffMethod: BackoffMethod = new FibonacciBackoffMethod(
  defaultBackoffOptions
);

/**
 * Executes a callback repeatedly until a desired result is achieved.
 *
 * Fibonacci backoff is used to increase time between subsequent attempts in
 * order to avoid overloading remote resources.
 *
 * @param callback - Callback that returns a Promise to retrieve some data.
 * @param evaluator - Callback to evaluate whether the data matches some condition.
 * @param backoffOptions - Backoff method configuration to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the retrieved result upon successful evaluation or rejects on timeout.
 */
export const poll = async <T>(
  callback: () => Promise<T>,
  evaluator: (T) => boolean,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
): Promise<T> => {
  const pollPromise = async () => {
    const result = await callback();
    if (evaluator(result)) {
      return result;
    } else {
      throw new Error();
    }
  };

  const backoff: BackoffMethod = (() => {
    if (backoffOptions instanceof BackoffMethod) {
      return backoffOptions;
    }
    if (backoffOptions === undefined) {
      return defaultBackoffMethod;
    }
    return new FibonacciBackoffMethod({
      ...defaultBackoffOptions,
      ...backoffOptions,
    });
  })();

  let result: T | null = null;
  try {
    result = await attemptWithBackoff(backoff, pollPromise);
  } catch (_e) {
    const errorMessage = label
      ? `Poll '${label}' failed after ${backoff.options.maxAttempts} attempt(s)`
      : `Poll failed after ${backoff.options.maxAttempts} attempt(s)`;

    throw new Error(errorMessage);
  }
  return result;
};

/**
 * Polls a Linode with the given ID until it has the given status.
 *
 * @param linodeId - ID of Linode whose status should be polled.
 * @param desiredStatus - Desired status of Linode that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Linode's status or rejects on timeout.
 */
export const pollLinodeStatus = async (
  linodeId: number,
  desiredStatus: LinodeStatus,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
) => {
  const getLinodeStatus = async () => {
    const linode = await getLinode(linodeId);
    return linode.status;
  };

  const checkLinodeStatus = (status: LinodeStatus): boolean =>
    status === desiredStatus;

  return poll(getLinodeStatus, checkLinodeStatus, backoffOptions, label);
};

/**
 * Polls an Image with the given ID until it has the given status.
 *
 * @param imageId - ID of Image whose status should be polled.
 * @param desiredStatus - Desired status of Image that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Image's status or rejects on timeout.
 */
export const pollImageStatus = async (
  imageId: string,
  desiredStatus: ImageStatus,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
) => {
  const getImageStatus = async () => {
    const image = await getImage(imageId);
    return image.status;
  };

  const checkImageStatus = (status: ImageStatus): boolean =>
    status === desiredStatus;

  return poll(getImageStatus, checkImageStatus, backoffOptions, label);
};
