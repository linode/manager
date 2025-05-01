import { CreateTransferSchema } from '@linode/validation';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type {
  CreateTransferPayload,
  EntityTransfer,
} from '../entity-transfers/types';
import type { Filter, ResourcePage as Page, Params } from '../types';

/**
 * getServiceTransfers
 *
 * Returns a paginated list of all Service Transfers which this customer has created or accepted.
 */
export const getServiceTransfers = (params?: Params, filter?: Filter) =>
  Request<Page<EntityTransfer>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
    setURL(`${API_ROOT}/account/service-transfers`),
  );

/**
 * getServiceTransfer
 *
 * Get a single Service Transfer by its token (uuid). A Pending transfer
 * can be retrieved by any unrestricted user.
 *
 */
export const getServiceTransfer = (token: string) =>
  Request<EntityTransfer>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/account/service-transfers/${encodeURIComponent(token)}`,
    ),
  );

/**
 * createServiceTransfer
 *
 *  Creates a pending Service Transfer for one or more entities on
 *  the sender's account. Only unrestricted users can create a transfer.
 */
export const createServiceTransfer = (data: CreateTransferPayload) =>
  Request<EntityTransfer>(
    setMethod('POST'),
    setData(data, CreateTransferSchema),
    setURL(`${API_ROOT}/account/service-transfers`),
  );

/**
 * acceptServiceTransfer
 *
 * Accepts a transfer that has been created by a user on a different account.
 */
export const acceptServiceTransfer = (token: string) =>
  Request<{}>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/account/service-transfers/${encodeURIComponent(
        token,
      )}/accept`,
    ),
  );

/**
 * cancelServiceTransfer
 *
 * Cancels a pending transfer. Only unrestricted users on the account
 * that created the transfer are able to cancel it.
 *
 */
export const cancelServiceTransfer = (token: string) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/account/service-transfers/${encodeURIComponent(token)}`,
    ),
  );
