import * as React from 'react';
import TextField from 'src/components/TextField';

interface Props {
  answer?: string;
  isReadOnly: boolean;
  name: string;
  setFieldValue: (field: string, value: string) => void;
}

const Answer = (props: Props) => {
  const { isReadOnly, name, answer, setFieldValue } = props;
  const label = name.replace('answer-', 'Answer ');
  if (isReadOnly) {
    return <></>;
  }
  return (
    <TextField
      name={name}
      label={label}
      placeholder="Type your answer"
      defaultValue={answer}
      onChange={(e) => {
        setFieldValue(name, e.target.value);
      }}
    />
  );
};

export default Answer;
