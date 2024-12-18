import { signAgreement } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reportException } from 'src/exceptionReporting';
import { useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { APIError, Agreements } from '@linode/api-v4';

export const useAccountAgreements = (enabled?: boolean) => {
  const { data: profile } = useProfile();

  return useQuery<Agreements, APIError[]>({
    ...accountQueries.agreements,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled:
      enabled === undefined
        ? !profile?.restricted
        : enabled && !profile?.restricted,
  });
};

export const useMutateAccountAgreements = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], Partial<Agreements>>({
    mutationFn: signAgreement,
    onSuccess(data, variables) {
      queryClient.setQueryData<Agreements>(
        accountQueries.agreements.queryKey,
        (previousData) => {
          if (!previousData) {
            return undefined;
          }

          const newAgreements = { ...previousData };

          for (const key in variables) {
            if (variables[key as keyof Agreements] !== undefined) {
              newAgreements[key as keyof Agreements] = variables[
                key as keyof Agreements
              ]!;
            }
          }

          return newAgreements;
        }
      );
    },
  });
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
