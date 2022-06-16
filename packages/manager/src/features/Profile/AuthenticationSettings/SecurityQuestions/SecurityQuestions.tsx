import * as React from 'react';
import _ from 'lodash';
import { useFormik, FormikConfig } from 'formik';
import {
  useSecurityQuestions,
  useMutateSecurityQuestions,
} from 'src/queries/securityQuestions';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { SecurityQuestionsData } from '@linode/api-v4';
import { getAnsweredQuestions, securityQuestionsToItems } from './utilities';
import CircleProgress from 'src/components/CircleProgress';

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
  setAreSecurityQuestionsAnswered: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const SecurityQuestions = (props: Props) => {
  // const { setAreSecurityQuestionsAnswered } = props;

  const classes = useStyles();

  const { data: securityQuestionsData, isLoading } = useSecurityQuestions();
  const { mutateAsync: updateSecurityQuestions } = useMutateSecurityQuestions();

  const answeredQuestions = getAnsweredQuestions(securityQuestionsData);

  const options = securityQuestionsToItems(
    securityQuestionsData?.security_questions ?? []
  );

  const initalFormValues = { security_questions: answeredQuestions };

  const formikConfig: FormikConfig<SecurityQuestionsData> = {
    initialValues: initalFormValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateSecurityQuestions(values);
      } catch (e) {
        // Do something here I guess
      }
    },
  };

  const {
    values,
    handleSubmit,
    setFieldValue,
    handleChange,
    dirty,
  } = useFormik(formikConfig);

  const buttonCopy = answeredQuestions?.length === 3 ? 'Update' : 'Add';

  const isButtonDisabled =
    !dirty ||
    Object.values(values.security_questions).length === 0 ||
    values.security_questions.some(
      (questionResponse) =>
        questionResponse.response === null ||
        questionResponse.response.length < 3
    ); // I hate this so much

  const qaProps = {
    isQuestionLoading: isLoading,
    setFieldValue: setFieldValue,
    handleChange: handleChange,
    options: options,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Box className={classes.root}>
      <Typography variant="h3">Security Questions</Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions will help keep your account secure and only be
        used to verify your identity. Choose answers that are not easily guessed
        or discoverable through research.
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit}>
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[0]}
          index={0}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[1]}
          index={1}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[2]}
          index={2}
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
