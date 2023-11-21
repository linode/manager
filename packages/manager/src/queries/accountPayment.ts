import {
  ClientToken,
  PaymentMethod,
  getClientToken,
  getPaymentMethods,
} from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { useGrants } from 'src/queries/profile';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

export const queryKey = 'account-payment-methods';

export const usePaymentMethodsQuery = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<ResourcePage<PaymentMethod>, APIError[]>(
    [queryKey, params, filter],
    () => getPaymentMethods(params),
    {
      ...queryPresets.oneTimeFetch,
    }
  );
};

export const useAllPaymentMethodsQuery = () => {
  const { data: grants } = useGrants();

  return useQuery<PaymentMethod[], APIError[]>(
    queryKey + '-all',
    getAllPaymentMethodsRequest,
    {
      ...queryPresets.oneTimeFetch,
      enabled: grants?.global?.account_access !== null,
    }
  );
};

/**
 * This getAll is probably overkill for getting all paginated payment
 * methods, but for now, use it to be safe.
 */
export const getAllPaymentMethodsRequest = () =>
  getAll<PaymentMethod>((params) => getPaymentMethods(params))().then(
    (data) => data.data
  );

export const useClientToken = () =>
  useQuery<ClientToken, APIError[]>(
    queryKey + '-client-token',
    getClientToken,
    queryPresets.longLived
  );
