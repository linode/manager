import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect';
import InputLabel from 'src/components/core/InputLabel';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

interface Props {
  question?: string;
  isQuestionLoading: boolean;
  name: string;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  setFieldValue: (field: string, value: string) => void;
  options: Item<string>[];
}

const Question = (props: Props) => {
  const {
    question,
    name,
    isQuestionLoading,
    isReadOnly,
    onClickEdit,
    setFieldValue,
    options,
  } = props;
  const onChange = (item: Item<string>) => {
    setFieldValue(name, item.value);
  };
  const label = name.replace('question-', 'Question ');
  const currentOption = options.find((option) => option.value === question);
  if (isReadOnly) {
    return (
      <>
        <InputLabel>{label}</InputLabel>
        <Typography variant="body1" style={{ fontSize: '0.875rem' }}>
          {question}
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
