import {
  deleteDestination,
  deleteStream,
  getDestinations,
  getStreams,
} from '@linode/api-v4';
import { apiCheckErrors, isTestLabel } from 'support/api/common';
import { oauthToken, pageSize } from 'support/constants/api';
import { mockDestinationPayload } from 'support/constants/delivery';
import { depaginate } from 'support/util/paginate';

import type {
  CreateDestinationPayload,
  Destination,
  Stream,
} from '@linode/api-v4';

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

const makeDestinationCreateReq = (
  destinationPayload?: CreateDestinationPayload
) => {
  const destinationData: CreateDestinationPayload = destinationPayload
    ? destinationPayload
    : mockDestinationPayload;

  return cy.request({
    auth: {
      bearer: oauthToken,
    },
    body: destinationData,
    method: 'POST',
    url:
      Cypress.env('REACT_APP_API_ROOT') +
      'beta/' +
      'monitor/streams/destinations',
  });
};

/**
 * Use this method if you do not need to get the request detail
 * @param destination if undefined will use default
 * @returns destination object
 */
export const createDestination = (destination?: CreateDestinationPayload) => {
  return makeDestinationCreateReq(destination).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Destination ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
