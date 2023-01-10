import { AccountLogin, getAccountLogins } from '@linode/api-v4/lib/account';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

export const queryKey = 'account-login';

export const useAccountLoginsQuery = (params?: any, filter?: any) =>
  useQuery<ResourcePage<AccountLogin>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getAccountLogins(params, filter),
    {
      keepPreviousData: true,
    }
  );
