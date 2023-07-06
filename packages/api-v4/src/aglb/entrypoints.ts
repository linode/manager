import Request, { setData, setMethod, setURL } from '../request';
import { ResourcePage } from 'src/types';
import { BETA_API_ROOT } from 'src/constants';
import type {
  CreateEntrypointPayload,
  Entrypoint,
  EntrypointPayload,
} from './types';

/**
 * getEntrypoints
 *
 * Returns a paginated list of Akamai Global Load Balancer entry points
 */
export const getEntrypoints = () =>
  Request<ResourcePage<Entrypoint>>(
    setURL(`${BETA_API_ROOT}/aglb/entrypoints`),
    setMethod('GET')
  );

/**
 * getEntrypoint
 *
 * Returns an Akamai Global Load Balancer entry point
 */
export const getEntrypoint = (id: number) =>
  Request<Entrypoint>(
    setURL(`${BETA_API_ROOT}/aglb/entrypoints/${encodeURIComponent(id)}`),
    setMethod('GET')
  );

/**
 * createEntrypoint
 *
 * Creates an Akamai Global Load Balancer entry point
 */
export const createEntrypoint = (data: CreateEntrypointPayload) =>
  Request<Entrypoint>(
    setURL(`${BETA_API_ROOT}/aglb/entrypoints`),
    setData(data),
    setMethod('POST')
  );

/**
 * updateEntrypoint
 *
 * Updates an Akamai Global Load Balancer entry point
 */
export const updateEntrypoint = (
  id: number,
  data: Partial<EntrypointPayload>
) =>
  Request<Entrypoint>(
    setURL(`${BETA_API_ROOT}/aglb/entrypoints/${encodeURIComponent(id)}`),
    setData(data),
    setMethod('POST')
  );

/**
 * deleteEntrypoint
 *
 * Deletes an Akamai Global Load Balancer entry point
 */
export const deleteEntrypoint = (id: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/aglb/entrypoints/${encodeURIComponent(id)}`),
    setMethod('DELETE')
  );
