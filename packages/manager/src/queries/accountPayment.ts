import {
  getPaymentMethods,
  PaymentMethod,
} from '@linode/api-v4/lib/account';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';
import { getClientToken, ClientToken } from '@linode/api-v4/lib/account';

const queryKey = 'account-payment-methods';

export const usePaymentMethodsQuery = (params?: any) => {
  return useQuery<ResourcePage<PaymentMethod>, APIError[]>(
    [queryKey, params?.page, params?.page_size],
    () => getPaymentMethods(params),
    {
      ...queryPresets.longLived,
    }
  );
};

export const useAllPaymentMethodsQuery = () => {
  return useQuery<PaymentMethod[], APIError[]>(
    queryKey + '-all',
    getAllPaymentMethodsRequest,
    {
      ...queryPresets.longLived,
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

/**
 * Temporary helper function to help us find the main card on file as we
 * now have an endpoint that can return many payment methods
 */
export const getCreditCard = (paymentMethods: PaymentMethod[] | undefined) => {
  return paymentMethods?.find(
    (paymentMethod) =>
      paymentMethod.is_default === true && paymentMethod.type === 'credit_card'
  );
};

export const useClientToken = () =>
  useQuery<ClientToken, APIError[]>(
    queryKey + '-client-token',
    getClientToken,
    queryPresets.longLived
  );
