import {
  Agreements,
  getAccountAgreements,
  signAgreement,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryPresets, simpleMutationHandlers } from './base';

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
    simpleMutationHandlers<Agreements, Partial<Agreements>>(queryKey)
  );
};
