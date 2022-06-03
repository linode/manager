import {
  getPossibleSecurityQuestions,
  getUserSecurityQuestions,
  updateUserSecurityQuestions,
} from '@linode/api-v4/lib/profile';
import { SecurityQuestionsResponse, UserSecurityQuestionsRequest } from '@linode/api-v4/lib/profile/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery, useMutation } from 'react-query';
import { queryPresets, queryClient } from './base';

export const queryKey = 'securityQuestion';

export const usePossibleSecurityQuestions = () =>
  useQuery<SecurityQuestionsResponse, APIError[]>(queryKey, getPossibleSecurityQuestions, {
    ...queryPresets.oneTimeFetch,
  });

export const useUserSecurityQuestions = () =>
  useQuery<SecurityQuestionsResponse, APIError[]>(queryKey, getUserSecurityQuestions, {
    ...queryPresets.oneTimeFetch,
  });

export const updateUserSecurityQuestionsData = ( newQuestions: SecurityQuestionsResponse): void => {
  queryClient.setQueryData(queryKey, () => (newQuestions));
};

export const useMutateUserSecurityQuestions = () => {
  return useMutation<UserSecurityQuestionsRequest, APIError[], UserSecurityQuestionsRequest>(
    (data) => {
      return updateUserSecurityQuestions(data)
    },
    { onSuccess: updateUserSecurityQuestionsData }
  );
}
