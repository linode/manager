import { createStreamSchema, updateStreamSchema } from '@linode/validation';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { CreateStreamPayload, Stream, UpdateStreamPayload } from './types';

/**
 * Returns all the information about a specified Stream.
 *
 * @param streamId { number } The ID of the Stream to access.
 *
 */
export const getStream = (streamId: number) =>
  Request<Stream>(
    setURL(`${BETA_API_ROOT}/monitor/streams/${encodeURIComponent(streamId)}`),
    setMethod('GET'),
  );

/**
 * Returns a paginated list of Streams.
 *
 */
export const getStreams = (params?: Params, filter?: Filter) =>
  Request<Page<Stream>>(
    setURL(`${BETA_API_ROOT}/monitor/streams`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Adds a new Stream.
 *
 * @param data { object } Data for type, label, etc.
 */
export const createStream = (data: CreateStreamPayload) =>
  Request<Stream>(
    setData(data, createStreamSchema),
    setURL(`${BETA_API_ROOT}/monitor/streams`),
    setMethod('POST'),
  );

/**
 * Updates a Stream.
 *
 * @param streamId { number } The ID of the Stream.
 * @param data { object } Options for type, status, etc.
 */
export const updateStream = (streamId: number, data: UpdateStreamPayload) =>
  Request<Stream>(
    setData(data, updateStreamSchema),
    setURL(`${BETA_API_ROOT}/monitor/streams/${encodeURIComponent(streamId)}`),
    setMethod('PUT'),
  );

/**
 * Deletes a Stream.
 *
 * @param streamId { number } The ID of the Stream.
 */
export const deleteStream = (streamId: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/monitor/streams/${encodeURIComponent(streamId)}`),
    setMethod('DELETE'),
  );
