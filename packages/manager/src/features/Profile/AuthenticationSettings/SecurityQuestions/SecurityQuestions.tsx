import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FormControl from 'src/components/core/FormControl';
import Box from 'src/components/core/Box';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';

// type SecurityQuestionsState = 'empty' | 'unchanged' | 'changed';

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
}));

const SecurityQuestions = () => {
  const classes = useStyles();
  //   const [state, setState] = React.useState('empty');

  return (
    <div className={classes.root}>
      <Typography variant="h3">Security Questions</Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions will help keep your account secure and will
        only be used to verify your identity.
      </Typography>
      <Box component={FormControl} className={classes.form}>
        <QuestionAndAnswerPair index={1} />
        <QuestionAndAnswerPair index={2} />
        <QuestionAndAnswerPair index={3} />
        <Button>Add Security Questions</Button>
      </Box>
    </div>
  );
};

export default SecurityQuestions;
