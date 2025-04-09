import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import { IamUserPermissions, IamAccountPermissions } from './types';

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
  Request<IamUserPermissions>(
    setURL(
      `${BETA_API_ROOT}/iam/role-permissions/users/${encodeURIComponent(
        username
      )}`
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
  data: Partial<IamUserPermissions>
) =>
  Request<IamUserPermissions>(
    setURL(
      `${BETA_API_ROOT}/iam/role-permissions/users/${encodeURIComponent(
        username
      )}`
    ),
    setMethod('PUT'),
    setData(data)
  );

/**
 * getAccountPermissions
 *
 * Return all permissions for account.
 *
 */
export const getAccountPermissions = () => {
  return Request<IamAccountPermissions>(
    setURL(`${BETA_API_ROOT}/iam/role-permissions`),
    setMethod('GET')
  );
};
