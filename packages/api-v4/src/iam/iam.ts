import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import { UserPermissions } from './types';

/**
 * getUserPermissions
 *
 * Returns the full permissions structure for this User. This includes all entities on
 * the Account alongside what level of access this User has to each of them.
 *
 * @param username { number } the username to look up.
 *
 */
export const getUserPermissions = (username: string) =>
  Request<UserPermissions>(
    setURL(
      `${API_ROOT}/iam/account/users/${encodeURIComponent(
        username
      )}/permissions`
    ),
    setMethod('GET')
  );
/**
 * updateUserPermissions
 *
 * Update the permissions a User has.
 *
 * @param username { number } ID of the client to be viewed.
 * @param data { object } the Permissions object to update.
 *
 */
export const updateUserPermissions = (
  username: string,
  data: Partial<UserPermissions>
) =>
  Request<UserPermissions>(
    setURL(
      `${API_ROOT}/iam/account/users/${encodeURIComponent(
        username
      )}/permissions`
    ),
    setMethod('PUT'),
    setData(data)
  );
