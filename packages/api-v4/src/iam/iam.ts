import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type { IamAccountRoles, IamUserRoles } from './types';

/**
 * getUserRoles
 *
 * Returns the full permissions structure for this User. This includes all entities on
 * the Account alongside what level of access this User has to each of them.
 *
 * @param username { string } the username to look up.
 *
 */
export const getUserRoles = (username: string) =>
  Request<IamUserRoles>(
    setURL(
      `${BETA_API_ROOT}/iam/users/${encodeURIComponent(
        username,
      )}/role-permissions`,
    ),
    setMethod('GET'),
  );

/**
 * updateUserRoles
 *
 * Update the roles a User has.
 *
 * @param username { string } username of the user to be updated.
 * @param data { object } the Roles object to update.
 *
 */
export const updateUserRoles = (username: string, data: IamUserRoles) =>
  Request<IamUserRoles>(
    setURL(
      `${BETA_API_ROOT}/iam/users/${encodeURIComponent(
        username,
      )}/role-permissions`,
    ),
    setMethod('PUT'),
    setData(data),
  );

/**
 * getAccountRoles
 *
 * Return all roles for account.
 *
 */
export const getAccountRoles = () => {
  return Request<IamAccountRoles>(
    setURL(`${BETA_API_ROOT}/iam/role-permissions`),
    setMethod('GET'),
  );
};
