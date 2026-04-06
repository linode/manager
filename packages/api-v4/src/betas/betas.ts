import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { Beta } from './types';

/**
 * getBetas
 *
 * Retrieve a paginated list of active beta programs.
 *
 **/
export const getBetas = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Beta>>(
    setURL(`${API_ROOT}/betas`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getBeta
 *
 * Retrieve details for a single beta program.
 *
 * @param betaId { string } The ID of the beta to be retrieved
 *
 */
export const getBeta = (betaId: string) =>
  Request<Beta>(
    setURL(`${API_ROOT}/betas/${encodeURIComponent(betaId)}`),
    setMethod('GET'),
  );
