import * as React from 'react';
import _ from 'lodash';
import { useFormik } from 'formik';
import { useMutateSecurityQuestions } from 'src/queries/securityQuestions';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import { SecurityQuestions } from '@linode/api-v4/lib/profile/types';

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
  securityQuestions?: SecurityQuestions;
  isLoading: boolean;
}

const SecurityQuestions = (props: Props) => {
  const classes = useStyles();

  const { securityQuestions, isLoading } = props;

  const { mutateAsync: updateSecurityQuestions } = useMutateSecurityQuestions();

  const questionAndAnswerTuples = Object.entries(securityQuestions || {});

  const initalFormValues = {
    ['question-1']: questionAndAnswerTuples?.[0]?.[0],
    ['question-2']: questionAndAnswerTuples?.[1]?.[0],
    ['question-3']: questionAndAnswerTuples?.[2]?.[0],
    ['answer-1']: questionAndAnswerTuples?.[0]?.[1],
    ['answer-2']: questionAndAnswerTuples?.[1]?.[1],
    ['answer-3']: questionAndAnswerTuples?.[2]?.[1],
  };

  const formik = useFormik({
    initialValues: initalFormValues,
    onSubmit: async (values) => {
      try {
        await updateSecurityQuestions({
          [values['question-1']]: values['answer-1'],
          [values['question-2']]: values['answer-2'],
          [values['question-3']]: values['answer-3'],
        });
      } catch (e) {
        // Do something here I guess
      }
    },
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  const getQuestionOptions = (selectedOptions: string[]) =>
    securityQuestionOptions.filter(
      (option) =>
        option.value !== selectedOptions[0] &&
        option.value !== selectedOptions[1]
    );

  const qaProps = {
    isQuestionLoading: isLoading,
    setFieldValue: formik.setFieldValue,
    setTouched: formik.setTouched,
  };

  const buttonCopy = questionAndAnswerTuples?.length === 0 ? 'Add' : 'Update';

  const isButtonDisabled =
    !formik.dirty || Object.values(formik.values).includes('');

  return (
    <Box className={classes.root}>
      <Typography variant="h3">Security Questions</Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions will help keep your account secure and only be
        used to verify your identity. Choose answers that are not easily guessed
        or discoverable through research.
      </Typography>
      <form className={classes.form} onSubmit={formik.handleSubmit}>
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[0]}
          index={1}
          options={getQuestionOptions([
            formik.values['question-2'],
            formik.values['question-3'],
          ])}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[1]}
          index={2}
          options={getQuestionOptions([
            formik.values['question-1'],
            formik.values['question-3'],
          ])}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionTuple={questionAndAnswerTuples[2]}
          index={3}
          options={getQuestionOptions([
            formik.values['question-1'],
            formik.values['question-2'],
          ])}
          {...qaProps}
        />
        <Box className={classes.button}>
          <Button
            buttonType="primary"
            type="submit"
            disabled={isButtonDisabled}
          >
            {`${buttonCopy} Security Questions`}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SecurityQuestions;
