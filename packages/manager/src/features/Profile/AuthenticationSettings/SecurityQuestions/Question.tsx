import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Select, { Item } from 'src/components/EnhancedSelect';
import InputLabel from 'src/components/core/InputLabel';
import Typography from 'src/components/core/Typography';
import { LinkButton } from 'src/components/LinkButton';

interface Props {
  questionResponse: SecurityQuestion | undefined;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  options: Item<number>[];
  index: number;
  setFieldValue: (field: string, value: SecurityQuestion) => void;
}

export const Question = (props: Props) => {
  const {
    questionResponse,
    isReadOnly,
    onClickEdit,
    options,
    index,
    setFieldValue,
  } = props;

  const currentOption = questionResponse
    ? {
        value: questionResponse.id,
        label: questionResponse.question,
      }
    : undefined;

  const name = `security_questions[${index}].id`;
  const label = `Question ${index + 1}`;
  const onChange = (item: Item<string>) => {
    setFieldValue(`security_questions[${index}]`, {
      id: Number.parseInt(item.value, 10),
      question: item.label,
      response: '',
    });
  };
  if (isReadOnly) {
    return (
      <>
        <InputLabel>{label}</InputLabel>
        <Typography variant="body1" style={{ fontSize: '0.875rem' }}>
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
      name={name}
      label={label}
      options={options}
      placeholder="Select a question"
      defaultValue={currentOption}
      isClearable={false}
      height="36px"
      onChange={onChange}
    />
  );
};
