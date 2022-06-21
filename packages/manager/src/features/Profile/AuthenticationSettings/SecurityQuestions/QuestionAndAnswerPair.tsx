import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Box from 'src/components/core/Box';
import { Question } from './Question';
import { Answer } from './Answer';
import { makeStyles, Theme } from 'src/components/core/styles';
import { Item } from 'src/components/EnhancedSelect';

interface Props {
  questionResponse: SecurityQuestion | undefined;
  options: Item<number>[];
  setFieldValue: (field: string, value: number | SecurityQuestion) => void;
  handleChange: any;
  edit: boolean;
  index: number;
  onEdit: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
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
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  question: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1.5,
  },
  answer: {
    paddingLeft: theme.spacing(5.75),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
}));

export const QuestionAndAnswerPair = (props: Props) => {
  const {
    questionResponse,
    options,
    setFieldValue,
    handleChange,
    edit,
    onEdit,
    ...rest
  } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box
        className={classes.question}
        style={{ paddingTop: !edit ? '16px' : 0 }}
      >
        <Question
          questionResponse={questionResponse}
          isReadOnly={!edit}
          onClickEdit={onEdit}
          options={options}
          setFieldValue={setFieldValue}
          {...rest}
        />
      </Box>
      <Box className={classes.answer}>
        <Answer
          isReadOnly={!edit}
          handleChange={handleChange}
          questionResponse={questionResponse}
          {...rest}
        />
      </Box>
    </Box>
  );
};
