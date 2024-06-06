import {
  ClientToken,
  PaymentMethod,
  makeDefaultPaymentMethod,
} from '@linode/api-v4/lib/account';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useGrants } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAllPaymentMethodsQuery = () => {
  const { data: grants } = useGrants();

  return useQuery<PaymentMethod[], FormattedAPIError[]>({
    ...accountQueries.paymentMethods,
    ...queryPresets.oneTimeFetch,
    enabled: grants?.global?.account_access !== null,
  });
};

export const useClientToken = () =>
  useQuery<ClientToken, FormattedAPIError[]>({
    ...accountQueries.clientToken,
    ...queryPresets.longLived,
  });

export const useMakeDefaultPaymentMethodMutation = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, FormattedAPIError[]>({
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
