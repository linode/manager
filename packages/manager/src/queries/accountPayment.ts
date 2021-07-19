import { getPaymentMethods, PaymentMethod } from '@linode/api-v4/lib/account';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';
import { getClientToken, ClientToken } from '@linode/api-v4/lib/account';

export const queryKey = 'account-payment-methods';

export const usePaymentMethodsQuery = (params: any = {}, filter: any = {}) => {
  return useQuery<ResourcePage<PaymentMethod>, APIError[]>(
    [queryKey, params, filter],
    () => getPaymentMethods(params),
    {
      ...queryPresets.oneTimeFetch,
    }
  );
};

export const useAllPaymentMethodsQuery = () => {
  return useQuery<PaymentMethod[], APIError[]>(
    queryKey + '-all',
    getAllPaymentMethodsRequest,
    {
      ...queryPresets.oneTimeFetch,
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
