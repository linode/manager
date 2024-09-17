import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { InputLabel } from 'src/components/InputLabel';
import { LinkButton } from 'src/components/LinkButton';
import { Typography } from 'src/components/Typography';

import type { SecurityQuestion } from '@linode/api-v4/lib/profile';

export interface SelectQuestionOption {
  label: string;
  value: number;
}

interface Props {
  index: number;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  options: SelectQuestionOption[];
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

  const label = `Question ${index + 1}`;

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
    <Autocomplete
      onChange={(_, item) => {
        setFieldValue(`security_questions[${index}]`, {
          id: item.value,
          question: item.label,
          response: '',
        });
      }}
      autoHighlight
      defaultValue={currentOption}
      disableClearable
      label={label}
      options={options}
      placeholder="Select a question"
      value={options.find((option) => option.value === questionResponse?.id)}
    />
  );
};
