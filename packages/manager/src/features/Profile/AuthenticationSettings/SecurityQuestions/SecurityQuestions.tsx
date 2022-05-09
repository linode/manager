import * as React from 'react';
import _ from 'lodash';
import { useFormik } from 'formik';
import {
  useSecurityQuestions,
  useMutateSecurityQuestions,
} from 'src/queries/securityQuestions';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
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

const SecurityQuestions = () => {
  const {
    data: securityQuestions,
    isLoading: securityQuestionsLoading,
  } = useSecurityQuestions();

  const classes = useStyles();

  const questionAndAnswerTuples = Object.entries(securityQuestions || {});
  const initalFormValues = {
    [questionAndAnswerTuples?.[0]?.[0]]: questionAndAnswerTuples?.[0]?.[1],
    [questionAndAnswerTuples?.[1]?.[0]]: questionAndAnswerTuples?.[1]?.[1],
    [questionAndAnswerTuples?.[2]?.[0]]: questionAndAnswerTuples?.[2]?.[1],
  };

  const { mutateAsync: updateSecurityQuestions } = useMutateSecurityQuestions();

  const formik = useFormik({
    initialValues: initalFormValues,
    onSubmit: (values) => {
      updateSecurityQuestions({
        [values['question-1']]: values['answer-1'],
        [values['question-2']]: values['answer-2'],
        [values['question-3']]: values['answer-3'],
      });
    },
  });

  const qaProps = {
    isQuestionLoading: securityQuestionsLoading,
    setFieldValue: formik.setFieldValue,
  };

  const buttonCopy = questionAndAnswerTuples?.length === 0 ? 'Add' : 'Update';

  return (
    <Box className={classes.root}>
      <form className={classes.form} onSubmit={formik.handleSubmit}>
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[0]}
          index={1}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[1]}
          index={2}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[2]}
          index={3}
          {...qaProps}
        />
        <Box className={classes.button}>
          <Button buttonType="primary" type="submit" disabled={formik.dirty}>
            {`${buttonCopy} Security Questions`}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SecurityQuestions;
