import * as React from 'react';
import TextField from 'src/components/TextField';

interface Props {
  answer?: string;
  index: number;
  isReadOnly: boolean;
}

const Answer = (props: Props) => {
  const { index, isReadOnly } = props;
  if (isReadOnly) {
    return <></>;
  }
  return (
    <TextField
      name={`answer-${index}`}
      label={`Answer ${index}`}
      placeholder="Type your answer"
    />
  );
};

export default Answer;
