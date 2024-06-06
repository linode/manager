import { signAgreement } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reportException } from 'src/exceptionReporting';
import { useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { Agreements } from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAccountAgreements = (enabled?: boolean) => {
  const { data: profile } = useProfile();

  return useQuery<Agreements, FormattedAPIError[]>({
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
  return useMutation<{}, FormattedAPIError[], Partial<Agreements>>({
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
            if (variables[key] !== undefined) {
              newAgreements[key] = variables[key];
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
  const FormattedAPIErrorMessage = err?.[0]?.reason;

  if (FormattedAPIErrorMessage) {
    customErrorMessage += `: ${FormattedAPIErrorMessage}`;
  }

  reportException(customErrorMessage);
};
