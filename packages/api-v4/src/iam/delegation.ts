import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL } from '../request';

import type { ResourcePage as Page, Params } from '../types';
import type { ChildAccount, ChildAccountWithUsers } from './delegation.types';
import type { IamUserRoles } from './types';
import type { Account } from 'src/account';
import type { Token } from 'src/profile';

//* **********************************
//* * Parent/Child delegation requests
//* **********************************

/**
 * Get All Child Accounts
 *
 * This API will return a paginated list of available child accounts under this parent account,
 * for whom the parent account admin can assign the delegation.
 */
type ParamsWithUsers = Params & { users?: boolean };
interface GetChildAccountsParams {
  params?: ParamsWithUsers;
  withUsers?: boolean;
}
export const getChildAccounts = ({
  params,
  withUsers,
}: GetChildAccountsParams) =>
  withUsers
    ? Request<Page<ChildAccountWithUsers>>(
        setURL(`${BETA_API_ROOT}/iam/delegation/child-accounts?users=true`),
        setMethod('GET'),
        setParams({ ...params }),
      )
    : Request<Page<ChildAccount>>(
        setURL(`${BETA_API_ROOT}/iam/delegation/child-accounts`),
        setMethod('GET'),
        setParams({ ...params }),
      );

/**
 * Get delegation for Parent Account
 *
 * This API will return a paginated list of child accounts a parent user is delegated to.
 * Only parent account administrators can call this API.
 */
interface GetDelegationForUserParams {
  params?: Params;
  username: string;
}
export const getDelegationForUser = ({
  username,
  params,
}: GetDelegationForUserParams) =>
  Request<Page<ChildAccount>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/users/${encodeURIComponent(username)}/child-accounts`,
    ),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Get delegation for Child Account
 *
 * This API is used by the parent account administrators to get the currently assigned paginated list
 * of their users who are delegated to manage the child account.
 */
interface GetDelegationForChildAccountParams {
  euuid: string;
  params?: Params;
}
export const getDelegationForChildAccount = ({
  euuid,
  params,
}: GetDelegationForChildAccountParams) =>
  Request<Page<string[]>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/${encodeURIComponent(euuid)}/users`,
    ),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Update delegation for Child Account
 *
 * This API will update the list of parent users who are delegated to manage the child account.
 * This API is used by the parent account administrators to assign list of their users to manage each child account.
 */
interface UpdateDelegationForChildAccountParams {
  data: string[];
  euuid: string;
}
export const updateDelegationForChildAccount = ({
  euuid,
  data,
}: UpdateDelegationForChildAccountParams) =>
  Request<Page<string[]>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/${encodeURIComponent(euuid)}/users`,
    ),
    setMethod('PUT'),
    setData(data),
  );

/**
 * Get All User Delegated Child Accounts information
 *
 * This API should return only child accounts that
 * - the user has 'view_child_account' permission granted on that child account
 * - the user has an Active delegate user in the child account
 *
 * Returns a paginated list of information for the child accounts that exist for your parent account.
 */
interface GetAllUserDelegatedChildAccountsParams {
  params?: Params;
}
export const getAllUserDelegatedChildAccounts = ({
  params,
}: GetAllUserDelegatedChildAccountsParams) =>
  Request<Page<Account>>(
    setURL(`${BETA_API_ROOT}/iam/delegation/profile/child-accounts`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Get Child Account information
 *
 * View a specific child account based on its euuid
 * This operation can only be accessed by an unrestricted user, or restricted user with the child_account_access grant.
 */
export const getChildAccountInformation = ({ euuid }: { euuid: string }) =>
  Request<Account>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/profile/child-accounts/${encodeURIComponent(euuid)}`,
    ),
    setMethod('GET'),
  );

/**
 * Get child account token
 *
 * Create a short-lived bearer token for a parent user on a child account, using the euuid of that child account.
 * In the context of the API, a parent user on a child account is referred to as a "proxy user."
 * When Akamai provisions your parent-child account environment, a proxy user is automatically set in the child account.
 */
export const getChildAccountToParentAccountMapping = ({
  euuid,
}: {
  euuid: string;
}) =>
  Request<Token>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/child-accounts/${encodeURIComponent(euuid)}/token`,
    ),
    setMethod('GET'),
  );

//* ******************************
//* * Parent/Child access requests
//* ******************************

/**
 * Get default access
 *
 * This API will return the default access for a child account.
 */
export const getDefaultAccess = () =>
  Request<IamUserRoles>(
    setURL(`${BETA_API_ROOT}/iam/delegation/default-role-permissions`),
    setMethod('GET'),
  );

/**
 * Update default access
 *
 * This API will let the child account administrator to update the default access.
 */
export const updateDefaultAccess = (data: IamUserRoles) =>
  Request<IamUserRoles>(
    setURL(`${BETA_API_ROOT}/iam/delegation/default-role-permissions`),
    setMethod('PUT'),
    setData(data),
  );
