import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FormControl from 'src/components/core/FormControl';
import Box from 'src/components/core/Box';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    maxWidth: 960,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    paddingTop: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row-reverse',
    [theme.breakpoints.down('sm')]: {
      '& > button': {
        width: '100%',
      },
    },
  },
}));

interface Props {
  questions: string[];
  answers: string[];
}

const hasTheUserAnsweredQuestions = (
  questions: Props['questions'],
  answers: Props['answers']
) => {
  if (questions.length !== 3 && answers.length !== 3) {
    return false;
  }
  return true;
};

const SecurityQuestions = (props: Props) => {
  const classes = useStyles();
  const { questions, answers } = props;
  const isEmpty = hasTheUserAnsweredQuestions(questions, answers);
  const submitButtonCopy = isEmpty ? 'Add' : 'Update';
  return (
    <div className={classes.root}>
      <Typography variant="h3">Security Questions</Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions will help keep your account secure and will
        only be used to verify your identity.
      </Typography>
      <Box component={FormControl} className={classes.form}>
        <QuestionAndAnswerPair questionIndex={1} currentQuestion="" />
        <QuestionAndAnswerPair questionIndex={2} />
        <QuestionAndAnswerPair questionIndex={3} />
      </Box>
      <Box className={classes.button}>
        <Button buttonType="primary">
          {submitButtonCopy} Security Questions
        </Button>
      </Box>
    </div>
  );
};

export default SecurityQuestions;
