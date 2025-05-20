import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Answer } from './Answer';
import { Question } from './Question';

import type { SelectQuestionOption } from './Question';
import type { SecurityQuestion } from '@linode/api-v4/lib/profile';

interface Props {
  edit: boolean;
  handleChange: any;
  index: number;
  onEdit: () => void;
  options: SelectQuestionOption[];
  questionResponse: SecurityQuestion | undefined;
  securityQuestionRef?: React.RefObject<HTMLInputElement>;
  setFieldValue: (field: string, value: number | SecurityQuestion) => void;
}

export const QuestionAndAnswerPair = (props: Props) => {
  const {
    edit,
    handleChange,
    onEdit,
    options,
    questionResponse,
    securityQuestionRef,
    setFieldValue,
    ...rest
  } = props;

  return (
    <StyledRootContainer>
      <StyledQuestionContainer edit={edit}>
        <Question
          isReadOnly={!edit}
          onClickEdit={onEdit}
          options={options}
          questionResponse={questionResponse}
          setFieldValue={setFieldValue}
          {...rest}
        />
      </StyledQuestionContainer>
      <StyledAnswerContainer>
        <Answer
          handleChange={handleChange}
          isReadOnly={!edit}
          questionResponse={questionResponse}
          securityQuestionRef={securityQuestionRef}
          {...rest}
        />
      </StyledAnswerContainer>
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled(Box, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  '& > div': {
    flexGrow: 1,
    width: '100%',
  },
  display: 'flex',
  flexBasis: 'flex-start',
  minHeight: '74px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const StyledQuestionContainer = styled(Box, {
  label: 'StyledQuestionContainer',
  shouldForwardProp: (propName) => propName !== 'edit',
})<{ edit: boolean }>(({ edit, theme }) => ({
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
