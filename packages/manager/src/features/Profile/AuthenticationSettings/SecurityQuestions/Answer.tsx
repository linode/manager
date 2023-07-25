import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import * as React from 'react';

import { TextField } from 'src/components/TextField';

interface Props {
  handleChange: any;
  index: number;
  isReadOnly: boolean;
  questionResponse?: SecurityQuestion;
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
      label={label}
      name={name}
      onChange={handleChange}
      placeholder="Type your answer"
      value={questionResponse?.response ?? ''}
    />
  );
};
