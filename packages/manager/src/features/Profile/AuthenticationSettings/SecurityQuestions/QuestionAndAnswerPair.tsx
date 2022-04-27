import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';
import QuestionView from './Question';
import Answer from './Answer';
import { securityQuestions, QuestionStatus, Question, Editable } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
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
  },
  answer: {},
}));

const QuestionAndAnswerPair = (props: Omit<Question, keyof Editable>) => {
  const { questionIndex } = props;
  const classes = useStyles();
  const [status, setStatus] = React.useState<QuestionStatus>('display');

  const enableEditStatus = () => {
    setStatus('edit');
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.question}>
        <QuestionView
          questionIndex={questionIndex}
          currentQuestion={securityQuestions[0]}
          answer="Hello"
          status={status}
          onClickEdit={enableEditStatus}
        />
      </Box>
      <Box className={classes.answer}>
        <Answer questionIndex={questionIndex} answer="Hello" status={status} />
      </Box>
    </Box>
  );
};

export default QuestionAndAnswerPair;
