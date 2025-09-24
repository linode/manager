import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL } from '../request';

import type { Account } from '../account';
import type { Token } from '../profile';
import type { ResourcePage as Page } from '../types';
import type {
  ChildAccount,
  ChildAccountWithDelegates,
  GetChildAccountDelegatesParams,
  GetChildAccountsIamParams,
  GetDelegatedChildAccountsForUserParams,
  GetMyDelegatedChildAccountsParams,
  UpdateChildAccountDelegatesParams,
} from './delegation.types';
import type { IamUserRoles } from './types';

export const getChildAccountsIam = ({
  params,
  users,
}: GetChildAccountsIamParams) =>
  users
    ? Request<Page<ChildAccountWithDelegates>>(
        setURL(`${BETA_API_ROOT}/iam/delegation/child-accounts?users=true`),
        setMethod('GET'),
        setParams({ ...params }),
      )
    : Request<Page<ChildAccount>>(
        setURL(`${BETA_API_ROOT}/iam/delegation/child-accounts`),
        setMethod('GET'),
        setParams({ ...params }),
      );

export const getDelegatedChildAccountsForUser = ({
  username,
  params,
}: GetDelegatedChildAccountsForUserParams) =>
  Request<Page<ChildAccount>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/users/${encodeURIComponent(username)}/child-accounts`,
    ),
    setMethod('GET'),
    setParams(params),
  );

export const getChildAccountDelegates = ({
  euuid,
  params,
}: GetChildAccountDelegatesParams) =>
  Request<Page<string[]>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/${encodeURIComponent(euuid)}/users`,
    ),
    setMethod('GET'),
    setParams(params),
  );

export const updateChildAccountDelegates = ({
  euuid,
  data,
}: UpdateChildAccountDelegatesParams) =>
  Request<Page<string[]>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/${encodeURIComponent(euuid)}/users`,
    ),
    setMethod('PUT'),
    setData(data),
  );

export const getMyDelegatedChildAccounts = ({
  params,
}: GetMyDelegatedChildAccountsParams) =>
  Request<Page<Account>>(
    setURL(`${BETA_API_ROOT}/iam/delegation/profile/child-accounts`),
    setMethod('GET'),
    setParams(params),
  );

export const getDelegatedChildAccount = ({ euuid }: { euuid: string }) =>
  Request<Account>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/profile/child-accounts/${encodeURIComponent(euuid)}`,
    ),
    setMethod('GET'),
  );

export const generateChildAccountToken = ({ euuid }: { euuid: string }) =>
  Request<Token>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/child-accounts/${encodeURIComponent(euuid)}/token`,
    ),
    setMethod('POST'),
    setData(euuid),
  );

export const getDefaultDelegationAccess = () =>
  Request<IamUserRoles>(
    setURL(`${BETA_API_ROOT}/iam/delegation/default-role-permissions`),
    setMethod('GET'),
  );

export const updateDefaultDelegationAccess = (data: IamUserRoles) =>
  Request<IamUserRoles>(
    setURL(`${BETA_API_ROOT}/iam/delegation/default-role-permissions`),
    setMethod('PUT'),
    setData(data),
  );
