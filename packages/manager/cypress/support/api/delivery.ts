import {
  deleteDestination,
  deleteStream,
  getDestinations,
  getStreams,
} from '@linode/api-v4';
import { isTestLabel } from 'support/api/common';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import type { Destination, Stream } from '@linode/api-v4';

/**
 * Deletes all destinations which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when destinations have been deleted.
 */
export const deleteAllTestDestinations = async (): Promise<void> => {
  const destinations = await depaginate<Destination>((page: number) =>
    getDestinations({ page, page_size: pageSize })
  );

  const deletionPromises = destinations
    .filter((destination: Destination) => isTestLabel(destination.label))
    .map((destination: Destination) => deleteDestination(destination.id));

  await Promise.all(deletionPromises);
};

/**
 * Deletes all streams which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when streams have been deleted.
 */
export const deleteAllTestStreams = async (): Promise<void> => {
  const streams = await depaginate<Stream>((page: number) =>
    getStreams({ page, page_size: pageSize })
  );

  const deletionPromises = streams
    .filter((destination: Stream) => isTestLabel(destination.label))
    .map((destination: Stream) => deleteStream(destination.id));

  await Promise.all(deletionPromises);
};
