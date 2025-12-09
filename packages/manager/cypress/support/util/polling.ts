/**
 * @file Utilities for polling APIs and other resources.
 */

import {
  getImage,
  getLinode,
  getLinodeDisk,
  getLinodeDisks,
  getVolume,
} from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';

import {
  attemptWithBackoff,
  BackoffMethod,
  FibonacciBackoffMethod,
  SimpleBackoffMethod,
} from './backoff';
import { depaginate } from './paginate';

import type { BackoffOptions } from './backoff';
import type {
  Disk,
  ImageStatus,
  LinodeStatus,
  VolumeStatus,
} from '@linode/api-v4';

/**
 * Describes a backoff configuration for a poll. This may be a partial BackoffOptions object,
 * an instance of a BackoffMethod implementation, or undefined.
 */
export type PollBackoffConfiguration =
  | BackoffMethod
  | Partial<BackoffOptions>
  | undefined;

// Default backoff options for a poll.
const defaultBackoffOptions: BackoffOptions = {
  initialDelay: 0,
  maxAttempts: 10,
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
  evaluator: (data: T) => boolean,
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

  let result: null | T = null;
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
 * By default, polling will occur after 15 seconds have passed, and reattempts
 * occur on a 5-second interval until the default Linode create timeout is reached.
 * This behavior can be customized by passing an alternative `backoffMethod`.
 *
 * @param linodeId - ID of Linode to poll.
 * @param desiredStatus - Desired status of Linode that is being polled.
 * @param backoffMethod - Optional backoff method for reattempts.
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

  // By default, wait 15 seconds before initial check then poll again every 5
  // seconds until default Linode create timeout is reached.
  const initialDelay = 15_000;
  const interval = 5_000;
  const maxAttempts = Math.ceil(
    (LINODE_CREATE_TIMEOUT - initialDelay) / interval
  );
  const defaultBackoffMethod = new SimpleBackoffMethod(interval, {
    initialDelay,
    maxAttempts,
  });

  const backoff = backoffOptions ? backoffOptions : defaultBackoffMethod;

  const checkLinodeStatus = (status: LinodeStatus): boolean =>
    status === desiredStatus;

  return poll(getLinodeStatus, checkLinodeStatus, backoff, label);
};

/**
 * Polls the status of a Linode's disks until all of them are in the desired state.
 *
 * @param linodeId - ID of Linode containing the disks to poll.
 * @param desiredStatus - Desired status of the disks that are being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to an array of disks or rejects on timeout.
 */
export const pollLinodeDiskStatuses = async (
  linodeId: number,
  desiredStatus: string,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
) => {
  const getDisks = async () =>
    depaginate((page) =>
      getLinodeDisks(linodeId, { page, page_size: pageSize })
    );
  const checkDisksStatus = (disks: Disk[]): boolean =>
    disks.every((disk: Disk) => disk.status === desiredStatus);

  return poll(getDisks, checkDisksStatus, backoffOptions, label);
};

/**
 * Polls the size of a Linode disk until it is the given size.
 *
 * Useful when waiting for a disk resize to complete.
 *
 * @param linodeId - ID of Linode containing the disk to poll.
 * @param diskId - ID of the disk to poll.
 * @param desiredSize - Desired size of the disk that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled disk's size or rejects on timeout.
 */
export const pollLinodeDiskSize = async (
  linodeId: number,
  diskId: number,
  desiredSize: number,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
) => {
  const getDiskSize = async () => {
    const disk = await getLinodeDisk(linodeId, diskId);
    return disk.size;
  };

  const checkDiskSize = (size: number): boolean => size === desiredSize;

  return poll(getDiskSize, checkDiskSize, backoffOptions, label);
};

/**
 * Polls an Image with the given ID until it has the given status.
 *
 * @param imageId - ID of Image to poll.
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

/**
 * Polls a Volume with the given ID until it has the given status.
 *
 * @param volumeId - ID of Volume to poll.
 * @param desiredStatus - Desired status of Volume that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Volume's status or rejects on timeout.
 */
export const pollVolumeStatus = async (
  volumeId: number,
  desiredStatus: VolumeStatus,
  backoffOptions: PollBackoffConfiguration = undefined,
  label: string | undefined = undefined
) => {
  const getVolumeStatus = async () => {
    const volume = await getVolume(volumeId);
    return volume.status;
  };

  const checkVolumeStatus = (status: VolumeStatus): boolean =>
    status === desiredStatus;

  return poll(getVolumeStatus, checkVolumeStatus, backoffOptions, label);
};
