import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type {
  AccountLogin,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAccountLoginsQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountLogin>, FormattedAPIError[]>({
    ...accountQueries.logins(params, filter),
    keepPreviousData: true,
  });
