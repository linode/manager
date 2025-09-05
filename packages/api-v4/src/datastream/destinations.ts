import { destinationSchema } from '@linode/validation';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateDestinationPayload,
  Destination,
  UpdateDestinationPayload,
} from './types';

/**
 * Returns all the information about a specified Destination.
 *
 * @param destinationId { number } The ID of the Destination to access.
 *
 */
export const getDestination = (destinationId: number) =>
  Request<Destination>(
    setURL(
      `${BETA_API_ROOT}/monitor/streams/destinations/${encodeURIComponent(destinationId)}`,
    ),
    setMethod('GET'),
  );

/**
 * Returns a paginated list of Destinations.
 *
 */
export const getDestinations = (params?: Params, filter?: Filter) =>
  Request<Page<Destination>>(
    setURL(`${BETA_API_ROOT}/monitor/streams/destinations`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Adds a new Destination.
 *
 * @param data { object } Data for type, label, etc.
 */
export const createDestination = (data: CreateDestinationPayload) =>
  Request<Destination>(
    setData(data, destinationSchema),
    setURL(`${BETA_API_ROOT}/monitor/streams/destinations`),
    setMethod('POST'),
  );

/**
 * Updates a Destination.
 *
 * @param destinationId { number } The ID of the Destination.
 * @param data { object } Options for type, label, etc.
 */
export const updateDestination = (
  destinationId: number,
  data: UpdateDestinationPayload,
) =>
  Request<Destination>(
    setData(data, destinationSchema),
    setURL(
      `${BETA_API_ROOT}/monitor/streams/destinations/${encodeURIComponent(destinationId)}`,
    ),
    setMethod('PUT'),
  );

/**
 * Deletes a Destination.
 *
 * @param destinationId { number } The ID of the Destination.
 */
export const deleteDestination = (destinationId: number) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/monitor/streams/destinations/${encodeURIComponent(destinationId)}`,
    ),
    setMethod('DELETE'),
  );
