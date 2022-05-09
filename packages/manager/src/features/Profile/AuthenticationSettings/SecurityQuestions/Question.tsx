import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

const securityQuestionStrings = [
  'What were the last four digits of your childhood phone number?',
  'What primary school did you attend?',
  'In what town or city did your parents meet?',
  'What is the middle name of your oldest child?',
  "What are the last five digits of your driver's license number?",
  'What time of the day were you born?(hh:mm)',
];

const securityQuestionOptions = securityQuestionStrings.map((question) => ({
  label: question,
  value: question,
}));

interface Props {
  question?: string;
  isQuestionLoading: boolean;
  index: number;
  isReadOnly?: boolean;
  onClickEdit: () => void;
  setFieldValue: (field: string, value: string) => void;
}

const Question = (props: Props) => {
  const {
    question,
    index,
    isQuestionLoading,
    isReadOnly,
    onClickEdit,
    setFieldValue,
  } = props;
  const onChange = (item: Item<string>) => {
    setFieldValue(`question-${index}`, item.value);
  };
  const currentOption = securityQuestionOptions.find(
    (option) => option.value === question
  );
  if (isReadOnly) {
    return (
      <>
        <Typography variant="h3">{`Question ${index}`}</Typography>
        <Typography variant="body1">
          {question}
          <Button buttonType="secondary" compact onClick={onClickEdit}>
            Edit
          </Button>
        </Typography>
      </>
    );
  }
  return (
    <Select
      name={`question-${index}`}
      label={`Question ${index}`}
      options={securityQuestionOptions}
      isLoading={isQuestionLoading}
      placeholder="Select a question"
      defaultValue={currentOption}
      onChange={onChange}
    />
  );
};

export default Question;
