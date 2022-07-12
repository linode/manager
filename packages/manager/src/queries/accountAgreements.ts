import {
  Agreements,
  getAccountAgreements,
  signAgreement,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { reportException } from 'src/exceptionReporting';
import { useProfile } from 'src/queries/profile';
import { queryPresets, simpleMutationHandlers } from './base';

export const queryKey = 'account-agreements';

export const useAccountAgreements = () => {
  const { data: profile } = useProfile();

  return useQuery<Agreements, APIError[]>(queryKey, getAccountAgreements, {
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccountAgreements = () => {
  return useMutation<{}, APIError[], Partial<Agreements>>(
    (data) => signAgreement(data),
    simpleMutationHandlers<Agreements, Partial<Agreements>>(queryKey)
  );
};

export const reportAgreementSigningError = (err: any) => {
  let customErrorMessage =
    'Expected to sign the EU agreement, but the request resulted in an error';
  const apiErrorMessage = err?.[0]?.reason;

  if (apiErrorMessage) {
    customErrorMessage += `: ${apiErrorMessage}`;
  }

  reportException(customErrorMessage);
};
