import {
  getSecurityQuestions,
  updateSecurityQuestions,
} from '@linode/api-v4/lib/profile';
import { SecurityQuestions } from '@Linode/api-v4/lib/profile/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery, useMutation } from 'react-query';
import { queryPresets, queryClient } from './base';

export const queryKey = 'securityQuestion';

export const useSecurityQuestions = () =>
  useQuery<SecurityQuestions, APIError[]>(queryKey, getSecurityQuestions, {
    ...queryPresets.oneTimeFetch,
  });

export const useMutateSecurityQuestions = () =>
  useMutation<SecurityQuestions, APIError[], Partial<SecurityQuestions>>(
    (data) => updateSecurityQuestions(data),
    { onSuccess: updateSecurityQuestionsData }
  );

export const updateSecurityQuestionsData = (newData: SecurityQuestions) => {
  queryClient.setQueryData(queryKey, (oldData: SecurityQuestions) => ({
    ...oldData,
    ...newData,
  }));
};
