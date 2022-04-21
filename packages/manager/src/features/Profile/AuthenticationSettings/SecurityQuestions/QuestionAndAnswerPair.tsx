import * as React from 'react';
import TextField from 'src/components/TextField';
import Select from 'src/components/EnhancedSelect/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';

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
  question: {},
  answer: {},
}));

interface Props {
  index: 1 | 2 | 3;
}

const QuestionAndAnswerPair = (props: Props) => {
  const { index } = props;
  const classes = useStyles();
  const questionPlaceholder = 'Select a question';
  const answerPlaceholder = 'Type your answer';
  return (
    <Box className={classes.root}>
      <Select
        name={`question-${index}`}
        label={`Question ${index}`}
        placeholder={questionPlaceholder}
        className={classes.question}
      />
      <TextField
        name={`answer-${index}`}
        label={`Answer ${index}`}
        placeholder={answerPlaceholder}
        className={classes.answer}
        fullWidth
      />
    </Box>
  );
};

export default QuestionAndAnswerPair;
