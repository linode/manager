import { Autocomplete, InputLabel, LinkButton, Typography } from '@linode/ui';
import * as React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';

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
        <Typography
          style={{
            display: 'flex',
            flexDirection: 'row',
            fontSize: '0.875rem',
          }}
          variant="body1"
        >
          <MaskableText isToggleable text={questionResponse?.question} />
          <LinkButton onClick={onClickEdit} style={{ marginLeft: 10 }}>
            Edit
          </LinkButton>
        </Typography>
      </>
    );
  }
  return (
    <Autocomplete
      autoHighlight
      defaultValue={currentOption}
      disableClearable
      label={label}
      onChange={(_, item) => {
        setFieldValue(`security_questions[${index}]`, {
          id: item.value,
          question: item.label,
          response: '',
        });
      }}
      options={options}
      placeholder="Select a question"
      value={options.find((option) => option.value === questionResponse?.id)}
    />
  );
};
