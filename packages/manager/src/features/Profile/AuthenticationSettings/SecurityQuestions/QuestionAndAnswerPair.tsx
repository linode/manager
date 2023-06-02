import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Box from 'src/components/core/Box';
import { Question } from './Question';
import { Answer } from './Answer';
import { Item } from 'src/components/EnhancedSelect';
import { styled } from '@mui/material/styles';

interface Props {
  edit: boolean;
  handleChange: any;
  index: number;
  onEdit: () => void;
  options: Item<number>[];
  questionResponse: SecurityQuestion | undefined;
  setFieldValue: (field: string, value: number | SecurityQuestion) => void;
}

export const QuestionAndAnswerPair = (props: Props) => {
  const {
    edit,
    handleChange,
    onEdit,
    options,
    questionResponse,
    setFieldValue,
    ...rest
  } = props;

  return (
    <StyledRootContainer>
      <StyledQuestionContainer edit={edit}>
        <Question
          questionResponse={questionResponse}
          isReadOnly={!edit}
          onClickEdit={onEdit}
          options={options}
          setFieldValue={setFieldValue}
          {...rest}
        />
      </StyledQuestionContainer>
      <StyledAnswerContainer>
        <Answer
          isReadOnly={!edit}
          handleChange={handleChange}
          questionResponse={questionResponse}
          {...rest}
        />
      </StyledAnswerContainer>
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled(Box, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  display: 'flex',
  flexBasis: 'flex-start',
  minHeight: '74px',
  '& > div': {
    flexGrow: 1,
    width: '100%',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const StyledQuestionContainer = styled(Box, {
  label: 'StyledQuestionContainer',
})<{ edit: boolean }>(({ theme, edit }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 1.5,
  paddingTop: !edit ? theme.spacing(2) : 0,
}));

const StyledAnswerContainer = styled(Box, {
  label: 'StyledQuestionContainer',
})(({ theme }) => ({
  paddingLeft: theme.spacing(5.75),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0,
  },
}));
