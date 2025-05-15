import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type {
  AccountLogin,
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useAccountLoginsQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountLogin>, APIError[]>({
    ...accountQueries.logins(params, filter),
    placeholderData: keepPreviousData,
  });
