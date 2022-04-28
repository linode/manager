import Typography from 'src/components/core/Typography';
import * as React from 'react';
import Select from 'src/components/EnhancedSelect/Select';
import InputLabel from 'src/components/core/InputLabel';
import Button from 'src/components/Button';
import {
  securityQuestions,
  SecurityQuestion,
  AnsweredQuestion,
  Editable,
  Question as QuestionView,
} from './types';

type SecurityQuestionOption = {
  value: SecurityQuestion;
  label: SecurityQuestion;
};

// Type predicate to determine if a given
export const isQuestionAnswered = (
  question: QuestionView
): question is Extract<QuestionView, AnsweredQuestion> => {
  const answeredQuestion = question as AnsweredQuestion;
  const editableQuestion = question as Editable;
  const hasNonEmptyAnswer = answeredQuestion?.answer?.length > 0;
  const isBeingEditied = editableQuestion.status === 'edit';
  return (
    hasNonEmptyAnswer &&
    answeredQuestion.currentQuestion !== undefined &&
    !isBeingEditied
  );
};

const makeSecurityQuestionOption = (
  question: SecurityQuestion
): SecurityQuestionOption => {
  return { value: question, label: question };
};

const placeholder = 'Please select a question.';
const securityQuestionOptions = securityQuestions.map((question) =>
  makeSecurityQuestionOption(question)
);

const AnsweredQuestion = (props: QuestionView) => {
  const { currentQuestion, questionIndex, onClickEdit } = props;
  return (
    <>
      <InputLabel style={{ transform: 'none', paddingTop: '8px' }}>
        Question {questionIndex}
      </InputLabel>
      <Typography style={{ fontSize: '14px', lineHeight: '18px' }}>
        {currentQuestion}
        <Button
          onClick={onClickEdit}
          buttonType="secondary"
          compact
          style={{
            fontWeight: '400',
            fontFamily: 'LatoWeb, sans-serif',
            fontSize: '14px',
            lineHeight: '18px',
          }}
        >
          Edit
        </Button>
      </Typography>
    </>
  );
};

const UnansweredOrEditingQuestion = (props: QuestionView) => {
  const { questionIndex, currentQuestion } = props;
  const filteredQuestions = securityQuestionOptions.filter(
    (question) => question.value !== currentQuestion
  );
  return (
    <Select
      placeholder={placeholder}
      options={filteredQuestions}
      name={`question${questionIndex}`}
      label={`Question ${questionIndex}`}
      currentValue={currentQuestion}
    />
  );
};

const QuestionView = (props: QuestionView) => {
  const isAnswered = isQuestionAnswered(props);
  return isAnswered ? (
    <AnsweredQuestion {...props} />
  ) : (
    <UnansweredOrEditingQuestion {...props} />
  );
};

export default QuestionView;
