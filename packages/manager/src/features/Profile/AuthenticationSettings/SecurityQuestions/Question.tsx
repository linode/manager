import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Select, { Item } from 'src/components/EnhancedSelect';
import InputLabel from 'src/components/core/InputLabel';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

interface Props {
  questionResponse: SecurityQuestion;
  isQuestionLoading: boolean;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  options: Item<number>[];
  index: number;
  setFieldValue: (field: string, value: SecurityQuestion) => void;
}

const Question = (props: Props) => {
  const {
    questionResponse,
    isQuestionLoading,
    isReadOnly,
    onClickEdit,
    options,
    index,
    setFieldValue,
  } = props;

  const currentOption = {
    value: questionResponse.id,
    label: questionResponse.question,
  };

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
          <Button
            buttonType="secondary"
            compact
            onClick={onClickEdit}
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
  }
  return (
    <Select
      name={name}
      label={label}
      options={options}
      isLoading={isQuestionLoading}
      placeholder="Select a question"
      defaultValue={currentOption}
      isClearable={false}
      height="36px"
      onChange={onChange}
    />
  );
};

export default Question;
