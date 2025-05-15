import { updateSecurityQuestions } from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type {
  APIError,
  SecurityQuestionsData,
  SecurityQuestionsPayload,
} from '@linode/api-v4';

export const useSecurityQuestions = ({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) => {
  return useQuery<SecurityQuestionsData, APIError[]>({
    ...profileQueries.securityQuestions,
    ...queryPresets.oneTimeFetch,
    enabled,
  });
};

export const useMutateSecurityQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SecurityQuestionsPayload,
    APIError[],
    SecurityQuestionsPayload
  >({
    mutationFn: updateSecurityQuestions,
    onSuccess: (response) => {
      queryClient.setQueryData<SecurityQuestionsData | undefined>(
        profileQueries.securityQuestions.queryKey,
        (oldData) => {
          if (oldData === undefined) {
            return undefined;
          }

          const newQuestions: SecurityQuestionsData['security_questions'] =
            oldData.security_questions.map((item) => ({
              ...item,
              response: null,
            }));

          for (let i = 0; i < response.security_questions.length; i++) {
            const index = oldData.security_questions.findIndex(
              (question) =>
                question.id === response.security_questions[i].question_id,
            );

            newQuestions[index].response =
              response.security_questions[i].response;
          }

          for (let i = 0; i < response.security_questions.length; i++) {
            const index = newQuestions.findIndex(
              (question) =>
                question.id === response.security_questions[i].question_id,
            );
            moveInArray(newQuestions, index, i);
          }

          return {
            security_questions: newQuestions,
          };
        },
      );
    },
  });
};

function moveInArray(arr: any[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
