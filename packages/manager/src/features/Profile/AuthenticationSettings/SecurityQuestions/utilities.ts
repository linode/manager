import type {
  SecurityQuestion,
  SecurityQuestionsData,
} from '@linode/api-v4/lib/profile';

export const securityQuestionsToItems = (
  questions: SecurityQuestion[] = []
) => {
  return questions.map((questionData) => ({
    label: questionData.question,
    value: questionData.id,
  }));
};

export const getAnsweredQuestions = (
  secuirtyQuestionsData?: SecurityQuestionsData
) => {
  if (secuirtyQuestionsData !== undefined) {
    return secuirtyQuestionsData.security_questions.filter(
      (questionData) => questionData.response !== null
    );
  }
  return [];
};
