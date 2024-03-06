import {
  ClientToken,
  PaymentMethod,
  getPaymentMethods,
  makeDefaultPaymentMethod,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useGrants } from 'src/queries/profile';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

export const useAllPaymentMethodsQuery = () => {
  const { data: grants } = useGrants();

  return useQuery<PaymentMethod[], APIError[]>({
    ...accountQueries.paymentMethods,
    ...queryPresets.oneTimeFetch,
    enabled: grants?.global?.account_access !== null,
  });
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
  useQuery<ClientToken, APIError[]>({
    ...accountQueries.clientToken,
    ...queryPresets.longLived,
  });

export const useMakeDefaultPaymentMethodMutation = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => makeDefaultPaymentMethod(id),
    onSuccess() {
      queryClient.setQueryData<PaymentMethod[]>(
        accountQueries.paymentMethods.queryKey,
        (previousData) => {
          if (!previousData) {
            return undefined;
          }

          return previousData.reduce<PaymentMethod[]>((acc, paymentMethod) => {
            if (paymentMethod.id === id) {
              acc.push({ ...paymentMethod, is_default: true });
            } else {
              acc.push({ ...paymentMethod, is_default: false });
            }
            return acc;
          }, []);
        }
      );
    },
  });
};
