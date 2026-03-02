import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { CreateLockPayload, ResourceLock } from './types';

/**
 * getLocks
 *
 * Returns a paginated list of resource locks on your Account.
 *
 * @param params { Params } Pagination parameters
 * @param filters { Filter } X-Filter for API
 */
export const getLocks = (params?: Params, filters?: Filter) =>
  Request<Page<ResourceLock>>(
    setURL(`${BETA_API_ROOT}/locks`),
    setMethod('GET'),
    setXFilter(filters),
  );

/**
 * getLock
 *
 * Returns information about a single resource lock.
 *
 * @param lockId { number } The ID of the lock to retrieve.
 */
export const getLock = (lockId: number) =>
  Request<ResourceLock>(
    setURL(`${BETA_API_ROOT}/locks/${encodeURIComponent(lockId)}`),
    setMethod('GET'),
  );

/**
 * createLock
 *
 * Creates a new resource lock to prevent accidental deletion or modification.
 *
 * @param payload { CreateLockPayload } The lock creation payload
 * @param payload.entity_type { string } The type of entity to lock (e.g., 'linode')
 * @param payload.entity_id { number | string } The ID of the entity to lock
 * @param payload.lock_type { string } The type of lock ('cannot_delete', 'cannot_delete_with_subresources')
 */
export const createLock = (payload: CreateLockPayload) =>
  Request<ResourceLock>(
    setURL(`${BETA_API_ROOT}/locks`),
    setData(payload),
    setMethod('POST'),
  );

/**
 * deleteLock
 *
 * Deletes a resource lock, allowing the resource to be deleted or modified.
 *
 * @param lockId { number } The ID of the lock to delete.
 */
export const deleteLock = (lockId: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/locks/${encodeURIComponent(lockId)}`),
    setMethod('DELETE'),
  );
