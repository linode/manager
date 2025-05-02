import {
  createSSHKeySchema,
  updateSSHKeySchema,
} from '@linode/validation/lib/profile.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { SSHKey } from './types';

/**
 * getSSHKeys
 *
 * Returns a collection of SSH Keys you've added to your Profile.
 *
 */
export const getSSHKeys = (params?: Params, filters?: Filter) =>
  Request<Page<SSHKey>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/profile/sshkeys`),
  );

/**
 * getSSHKey
 *
 * View a single SSH key by ID.
 *
 */
export const getSSHKey = (keyId: number) =>
  Request<SSHKey>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/sshkeys/${encodeURIComponent(keyId)}`),
  );

/**
 * createSSHKey
 *
 * Add an SSH key to your account.
 *
 */
export const createSSHKey = (data: { label: string; ssh_key: string }) =>
  Request<SSHKey>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/sshkeys`),
    setData(data, createSSHKeySchema),
  );

/**
 * updateSSHKey
 *
 * Update an existing SSH key. Currently, only the label field can be updated.
 *
 * @param keyId { number } the ID of the key to be updated.
 *
 */
export const updateSSHKey = (keyId: number, data: { label: string }) =>
  Request<SSHKey>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/profile/sshkeys/${encodeURIComponent(keyId)}`),
    setData(data, updateSSHKeySchema),
  );

/**
 * deleteSSHKey
 *
 * Remove a single SSH key from your Profile.
 *
 * @param keyId { number } the ID of the key to be deleted.
 *
 */
export const deleteSSHKey = (keyId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/profile/sshkeys/${encodeURIComponent(keyId)}`),
  );
