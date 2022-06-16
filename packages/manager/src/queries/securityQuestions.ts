import {
  getSecurityQuestions,
  updateSecurityQuestions,
  SecurityQuestionsData,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery, useMutation } from 'react-query';
import { queryPresets, queryClient } from './base';

export const queryKey = 'securityQuestions';

export const useSecurityQuestions = () =>
  useQuery<SecurityQuestionsData, APIError[]>(
    queryKey,
    getSecurityQuestions,
    {
      ...queryPresets.oneTimeFetch,
    }
  );

export const updateSecurityQuestionsData = (
  newQuestions: SecurityQuestionsData
): void => {
  queryClient.setQueryData(queryKey, () => ({
    security_questions: newQuestions,
  }));
};

export const useMutateSecurityQuestions = () => {
  return useMutation<
    SecurityQuestionsData,
    APIError[],
    SecurityQuestionsData
  >(
    (data) => {
      return updateSecurityQuestions(data);
    },
    { onSuccess: updateSecurityQuestionsData }
  );
};
