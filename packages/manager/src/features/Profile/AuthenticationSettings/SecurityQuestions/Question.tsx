import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect';
import { InputLabel } from 'src/components/InputLabel';
import { LinkButton } from 'src/components/LinkButton';
import { Typography } from 'src/components/Typography';

interface Props {
  index: number;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  options: Item<number>[];
  questionResponse: SecurityQuestion | undefined;
  setFieldValue: (field: string, value: SecurityQuestion) => void;
}

export const Question = (props: Props) => {
  const {
    index,
    isReadOnly,
    onClickEdit,
    options,
    questionResponse,
    setFieldValue,
  } = props;

  const currentOption = questionResponse
    ? {
        label: questionResponse.question,
        value: questionResponse.id,
      }
    : undefined;

  const name = `security_questions[${index}].id`;
  const label = `Question ${index + 1}`;
  const onChange = (item: Item<number>) => {
    setFieldValue(`security_questions[${index}]`, {
      id: item.value,
      question: item.label,
      response: '',
    });
  };
  if (isReadOnly) {
    return (
      <>
        <InputLabel>{label}</InputLabel>
        <Typography style={{ fontSize: '0.875rem' }} variant="body1">
          {questionResponse?.question}
          <LinkButton onClick={onClickEdit} style={{ marginLeft: 10 }}>
            Edit
          </LinkButton>
        </Typography>
      </>
    );
  }
  return (
    <Select
      defaultValue={currentOption}
      isClearable={false}
      label={label}
      name={name}
      onChange={onChange}
      options={options}
      placeholder="Select a question"
    />
  );
};
