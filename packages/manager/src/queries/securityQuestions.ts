import {
  SecurityQuestionsData,
  SecurityQuestionsPayload,
  updateSecurityQuestions,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from './base';
import { profileQueries } from './profile';

export const useSecurityQuestions = () =>
  useQuery<SecurityQuestionsData, APIError[]>({
    ...profileQueries.securityQuestions,
    ...queryPresets.oneTimeFetch,
  });

export const useMutateSecurityQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SecurityQuestionsPayload,
    APIError[],
    SecurityQuestionsPayload
  >({
    mutationFn: updateSecurityQuestions,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.securityQuestions.queryKey);
    },
  });
};
