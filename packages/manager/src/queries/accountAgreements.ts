import {
  Agreements,
  getAccountAgreements,
  signAgreement,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';

export const queryKey = 'account-agreements';

export const useAccountAgreements = () =>
  useQuery<Agreements, APIError[]>(
    queryKey,
    getAccountAgreements,
    queryPresets.oneTimeFetch
  );

export const useMutateAccountAgreements = () => {
  return useMutation<{}, APIError[], Partial<Agreements>>(
    (data) => signAgreement(data),
    {
      onSuccess: updateAccountAgreementsData,
    }
  );
};

/**
 * To be used as an onSuccess function for a React Query
 * Mutation to update the React Query Cache
 * @param newData data returned by the API - in this case the API always returns {}
 * @param variables varibles passed to the mutation to be sent to the API
 */
export const updateAccountAgreementsData = (
  newData: {},
  variables: Partial<Agreements>
): void => {
  queryClient.setQueryData(queryKey, (oldData: Agreements) => ({
    ...oldData,
    ...variables,
  }));
};
