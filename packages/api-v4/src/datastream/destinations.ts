import { createDestinationSchema } from '@linode/validation';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { CreateDestinationPayload, Destination } from './types';

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
    setData(data, createDestinationSchema),
    setURL(`${BETA_API_ROOT}/monitor/streams/destinations`),
    setMethod('POST'),
  );
