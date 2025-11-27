import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type { ResourcePage } from '../types';
import type {
  AccessType,
  EntityByPermission,
  IamAccountRoles,
  IamUserRoles,
  PermissionType,
} from './types';
import type { EntityType } from 'src/entities/types';
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

/**
 * getUserAccountPermissions
 *
 * Returns the current permissions for this User on the account.
 *
 * @param username { string } the username to look up.
 *
 */
export const getUserAccountPermissions = (username: string) =>
  Request<PermissionType[]>(
    setURL(
      `${BETA_API_ROOT}/iam/users/${encodeURIComponent(
        username,
      )}/permissions/account`,
    ),
    setMethod('GET'),
  );

/**
 * getUserEntityPermissions
 *
 * Returns the current permissions for this User on the entity.
 *
 * @param username { string } the username to look up.
 * @param entityType { AccessType } the entityType to look up.
 * @param entityId { number } the entityId to look up.
 */
export const getUserEntityPermissions = (
  username: string,
  entityType: AccessType,
  entityId: number | string,
) =>
  Request<PermissionType[]>(
    setURL(
      `${BETA_API_ROOT}/iam/users/${encodeURIComponent(
        username,
      )}/permissions/${entityType}/${entityId}`,
    ),
    setMethod('GET'),
  );

/**
 * getUserEntitiesByPermission
 *
 * Returns the available entities for a given permission.
 */
export interface GetEntitiesByPermissionParams {
  enabled?: boolean;
  entityType: EntityType;
  permission: PermissionType;
  username: string | undefined;
}

export const getUserEntitiesByPermission = ({
  username,
  entityType,
  permission,
}: GetEntitiesByPermissionParams) =>
  Request<ResourcePage<EntityByPermission>>(
    setURL(
      `${BETA_API_ROOT}/iam/users/${username}/entities/${entityType}?permission=${permission}`,
    ),
    setMethod('GET'),
  );
