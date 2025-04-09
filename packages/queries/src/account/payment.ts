import { makeDefaultPaymentMethod } from '@linode/api-v4/lib/account';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { useGrants } from '../profile';
import { accountQueries } from './queries';

import type { ClientToken, PaymentMethod } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';

export const useAllPaymentMethodsQuery = () => {
  const { data: grants } = useGrants();

  return useQuery<PaymentMethod[], APIError[]>({
    ...accountQueries.paymentMethods,
    ...queryPresets.oneTimeFetch,
    enabled: grants?.global?.account_access !== null,
  });
};

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
        },
      );
    },
  });
};
