import {
  SecurityQuestion,
  SecurityQuestionsData,
} from '@linode/api-v4/lib/profile';

export const securityQuestionsToItems = (
  questions: SecurityQuestion[] = []
) => {
  return questions.map((questionData) => ({
    value: questionData.id,
    label: questionData.question,
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
