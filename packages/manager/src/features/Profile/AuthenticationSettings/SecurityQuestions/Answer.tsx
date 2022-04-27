import * as React from 'react';
import TextField from 'src/components/TextField';
import { Question } from './types';

const NullReactComponent = () => {
  return <></>;
};

type AnswerProps = Omit<Question, 'currentQuestion' | 'onClickEdit'>;

const isAnsweredProps = (props: AnswerProps): props is AnswerProps => {
  const castAnswerProps = props as AnswerProps;
  const hasNonEmptyAnswer = Number(castAnswerProps?.answer?.length) > 0;
  return hasNonEmptyAnswer && castAnswerProps.status === 'edit';
};

const EditAnswer = (props: AnswerProps) => {
  return (
    <TextField
      label={`Answer ${props.questionIndex}`}
      placeholder="Type your answer"
    />
  );
};

const Answer = (props: AnswerProps) => {
  return isAnsweredProps(props) ? (
    <EditAnswer {...props} />
  ) : (
    <NullReactComponent />
  );
};

export default Answer;
