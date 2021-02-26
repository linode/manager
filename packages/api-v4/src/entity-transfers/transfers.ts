import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { ResourcePage as Page } from '../types';
import { CreateTransferSchema } from './transfers.schema';
import { CreateTransferPayload, EntityTransfer } from './types';

// SELF SERVE ENTITY TRANSFERS

/**
 * getEntityTransfers
 *
 * Returns a paginated list of all Entity Transfers which this customer has created or accepted.
 */
export const getEntityTransfers = (params?: any, filters?: any) =>
  Request<Page<EntityTransfer>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/account/entity-transfers`)
  );

/**
 * getEntityTransfer
 *
 * Get a single Entity Transfer by its token (uuid). A Pending transfer
 * can be retrieved by any unrestricted user.
 *
 */
export const getEntityTransfer = (token: string) =>
  Request<EntityTransfer>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/account/entity-transfers/${token}`)
  );

/**
 * createEntityTransfer
 *
 *  Creates a pending Entity Transfer for one or more entities on
 *  the sender's account. Only unrestricted users can create a transfer.
 */
export const createEntityTransfer = (data: CreateTransferPayload) =>
  Request<EntityTransfer>(
    setMethod('POST'),
    setData(data, CreateTransferSchema),
    setURL(`${BETA_API_ROOT}/account/entity-transfers`)
  );

/**
 * acceptEntityTransfer
 *
 * Accepts a transfer that has been created by a user on a different account.
 */
export const acceptEntityTransfer = (token: string) =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/account/entity-transfers/${token}/accept`)
  );

/**
 * cancelTransfer
 *
 * Cancels a pending transfer. Only unrestricted users on the account
 * that created the transfer are able to cancel it.
 *
 */
export const cancelTransfer = (token: string) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${BETA_API_ROOT}/account/entity-transfers/${token}`)
  );
