import { AccountLogin, getAccountLogins } from '@linode/api-v4/lib/account';
import { useQuery } from 'react-query';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const queryKey = 'account-login';

export const useAccountLoginsQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountLogin>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getAccountLogins(params, filter),
    {
      keepPreviousData: true,
    }
  );
