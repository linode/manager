import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Select, { Item } from 'src/components/EnhancedSelect';
import InputLabel from 'src/components/core/InputLabel';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

interface Props {
  questionResponse?: SecurityQuestion;
  isQuestionLoading: boolean;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  setFieldValue: (field: string, value: string) => void;
  options: Item<number>[];
  index: number;
}

const Question = (props: Props) => {
  const {
    questionResponse,
    isQuestionLoading,
    isReadOnly,
    onClickEdit,
    setFieldValue,
    options,
    index,
  } = props;

  const name = `question-${index}`;
  const onChange = (item: Item<string>) => {
    setFieldValue(name, item.value);
  };
  const label = name.replace('question-', 'Question ');
  const currentOption = options.find((option) => option.value === questionResponse?.id);
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
      onChange={onChange}
      isClearable={false}
      height="36px"
    />
  );
};

export default Question;
