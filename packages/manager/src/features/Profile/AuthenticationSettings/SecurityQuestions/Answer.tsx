import * as React from 'react';
import TextField from 'src/components/TextField';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';

interface Props {
  questionResponse?: SecurityQuestion;
  isReadOnly: boolean;
  index: number;
  handleChange: any;
}

export const Answer = (props: Props) => {
  const { handleChange, index, isReadOnly, questionResponse } = props;
  const label = `Answer ${index + 1}`;
  const name = `security_questions[${index}].response`;

  if (isReadOnly) {
    return null;
  }

  return (
    <TextField
      name={name}
      label={label}
      placeholder="Type your answer"
      value={questionResponse?.response ?? ''}
      onChange={handleChange}
    />
  );
};
