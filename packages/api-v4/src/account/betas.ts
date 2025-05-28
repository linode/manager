import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { AccountBeta, EnrollInBetaPayload } from './types';

/**
 * getBetas
 * Retrieve a paginated list of betas your account is enrolled in.
 *
 */
export const getAccountBetas = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<AccountBeta>>(
    setURL(`${API_ROOT}/account/betas`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getBeta
 * Retrieve details of a single beta your account is enrolled in.
 * @param betaId { string } The ID of the beta you want to be retrieved
 *
 */
export const getAccountBeta = (betaId: string) =>
  Request<AccountBeta>(
    setURL(`${API_ROOT}/account/betas/${encodeURIComponent(betaId)}`),
    setMethod('GET'),
  );

/**
 * enrollInBeta
 * Enrolls your account in the specified beta program.
 * @param data { object }
 * @param data.id { string } ID of the beta you want to be enrolled in.
 *
 */
export const enrollInBeta = (data: EnrollInBetaPayload) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/betas`),
    setMethod('POST'),
    setData(data),
  );
