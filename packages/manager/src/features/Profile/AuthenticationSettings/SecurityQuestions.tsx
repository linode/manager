import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FormControl from 'src/components/core/FormControl';
import TextField from 'src/components/TextField';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Box from 'src/components/core/Box';

type SecurityQuestionsState = 'empty' | 'unchanged' | 'changed';

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
  },
}));

const SecurityQuestions = () => {
  const classes = useStyles();
  const [state, setState] = React.useState('empty');
  const questionPlaceholder = 'Select a question';
  const answerPlaceholder = 'Type your answer';

  return (
    <div className={classes.root}>
      <Typography variant="h3">
        Security Questions
      </Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions will help keep your account secure and will only be used to verify your identity.
      </Typography>
      <FormControl className={classes.form}>
        <Box display="flex">
          <Box width="50%">
            <Select
              name="question-1"
              label="Question 1"
              placeholder={questionPlaceholder} />
            <Select
              name="question-2"
              label="Question 2"
              placeholder={questionPlaceholder} />
            <Select
              name="question-3"
              label="Question 3"
              placeholder={questionPlaceholder} />
          </Box>
          <Box width="50%">
            <TextField name="answer-1" label="Answer 1" placeholder={answerPlaceholder} />
            <TextField name="answer-2" label="Answer 2" placeholder={answerPlaceholder} />
            <TextField name="answer-3" label="Answer 3" placeholder={answerPlaceholder} />
          </Box>
        </Box>
      </FormControl>
    </div>
  )
}

export default SecurityQuestions;
