import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL } from '../request';

import type { ResourcePage as Page, Params } from '../types';
import type { ChildAccount, ChildAccountWithUsers } from './delegation.types';
import type { IamUserRoles } from './types';
import type { Account } from 'src/account';
import type { Token } from 'src/profile';

type ParamsWithDelegates = Params & { includeDelegates?: boolean };
interface ListChildAccountsParams {
  params?: ParamsWithDelegates;
}
export const listChildAccounts = ({ params }: ListChildAccountsParams) =>
  params?.includeDelegates
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

interface ListDelegatedChildAccountsForUserParams {
  params?: Params;
  username: string;
}
export const listDelegatedChildAccountsForUser = ({
  username,
  params,
}: ListDelegatedChildAccountsForUserParams) =>
  Request<Page<ChildAccount>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/users/${encodeURIComponent(username)}/child-accounts`,
    ),
    setMethod('GET'),
    setParams(params),
  );

interface ListChildAccountDelegatesParams {
  euuid: string;
  params?: Params;
}
export const listChildAccountDelegates = ({
  euuid,
  params,
}: ListChildAccountDelegatesParams) =>
  Request<Page<string[]>>(
    setURL(
      `${BETA_API_ROOT}/iam/delegation/child-accounts/${encodeURIComponent(euuid)}/users`,
    ),
    setMethod('GET'),
    setParams(params),
  );

interface UpdateChildAccountDelegatesParams {
  data: string[];
  euuid: string;
}
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

interface ListMyDelegatedChildAccountProfilesParams {
  params?: Params;
}
export const listMyDelegatedChildAccountProfiles = ({
  params,
}: ListMyDelegatedChildAccountProfilesParams) =>
  Request<Page<Account>>(
    setURL(`${BETA_API_ROOT}/iam/delegation/profile/child-accounts`),
    setMethod('GET'),
    setParams(params),
  );

export const getChildAccountProfile = ({ euuid }: { euuid: string }) =>
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
