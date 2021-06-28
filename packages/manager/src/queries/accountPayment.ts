import { getPaymentMethods, PaymentMethod } from '@linode/api-v4/lib/account';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

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

export const useAllPaymentMethodsQuery = (params?: any) => {
  return useQuery<PaymentMethod[], APIError[]>(
    ['all-' + queryKey, params?.page, params?.page_size],
    () => getAllPaymentMethodsRequest(params),
    {
      ...queryPresets.longLived,
    }
  );
};

/**
 * This getAll is probably overkill for getting all paginated payment
 * methods, but for now, use it to be safe.
 */
const getAllPaymentMethodsRequest = (passedParams: any = {}) =>
  getAll<PaymentMethod>((params) =>
    getPaymentMethods({ ...params, ...passedParams })
  )().then((data) => data.data);

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
