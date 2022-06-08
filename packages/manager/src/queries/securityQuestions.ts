import {
  getPossibleSecurityQuestions,
  getUserSecurityQuestions,
  updateUserSecurityQuestions,
} from '@linode/api-v4/lib/profile';
import { SecurityQuestionsResponse, UserSecurityQuestionsRequest } from '@linode/api-v4/lib/profile/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery, useMutation } from 'react-query';
import { queryPresets, queryClient } from './base';

export const allQuestionsQueryKey = 'allSecurityQuestions';
export const userQuestionsQueryKey = 'securityQuestions';

export const usePossibleSecurityQuestions = () =>
  useQuery<SecurityQuestionsResponse, APIError[]>(allQuestionsQueryKey, getPossibleSecurityQuestions, {
    ...queryPresets.oneTimeFetch,
  });

export const useUserSecurityQuestions = () =>
  useQuery<SecurityQuestionsResponse, APIError[]>(userQuestionsQueryKey, getUserSecurityQuestions, {
    ...queryPresets.oneTimeFetch,
  });

export const updateUserSecurityQuestionsData = (newQuestions: UserSecurityQuestionsRequest): void => {
  const securityQuestionsWithoutAnswers = newQuestions.security_questions.map(
    questionData =>
      ( { id: questionData.id, question: questionData.question }
  ));
  queryClient.setQueryData(userQuestionsQueryKey, () => ({ security_questions: securityQuestionsWithoutAnswers }));
}


export const useMutateUserSecurityQuestions = () => {
  return useMutation<UserSecurityQuestionsRequest, APIError[], UserSecurityQuestionsRequest>(
    (data) => {
      const requestBodyWithoutQuestions = {
        security_questions: data.security_questions.map(question => ({ id: question.id, answer: question.answer })),
      };
      return updateUserSecurityQuestions(requestBodyWithoutQuestions);
    },
    { onSuccess: updateUserSecurityQuestionsData }
  );
}
