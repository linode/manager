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
import { useSnackbar } from 'notistack';

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
  buttonContainer: {
    gap: theme.spacing(),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const SecurityQuestions = () => {
  const classes = useStyles();

  const { data: securityQuestionsData, isLoading } = useSecurityQuestions();
  const { mutateAsync: updateSecurityQuestions } = useMutateSecurityQuestions();
  const { enqueueSnackbar } = useSnackbar();

  const answeredQuestions = getAnsweredQuestions(securityQuestionsData);

  const hasSecurityQuestionsCompleted =
    securityQuestionsData?.security_questions.filter(
      (question) => question.response
    ).length === 3;

  const options = securityQuestionsToItems(
    securityQuestionsData?.security_questions ?? []
  );

  const initalFormValues = { security_questions: answeredQuestions };

  const formikConfig: FormikConfig<SecurityQuestionsData> = {
    initialValues: initalFormValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateSecurityQuestions({
          security_questions: values.security_questions.map((item) => ({
            question_id: item.id,
            response: item.response as string,
          })),
        });
        enqueueSnackbar(
          `Successfully ${buttonCopy.toLowerCase()}ed your security questions`,
          { variant: 'success' }
        );
        onCancel();
      } catch (e) {
        enqueueSnackbar(
          `Failed to ${buttonCopy.toLowerCase()} your security questions`,
          { variant: 'error' }
        );
      }
    },
  };

  const [questionEditStates, setQuestionEditStates] = React.useState<boolean[]>(
    hasSecurityQuestionsCompleted ? [false, false, false] : [true, true, true]
  );

  const onEdit = (index: number) => {
    setQuestionEditStates((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const onCancel = () => {
    setQuestionEditStates([false, false, false]);
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
    values.security_questions.length === 0 ||
    values.security_questions.some(
      (questionResponse) =>
        questionResponse.response === null ||
        questionResponse.response.length < 3
    );

  const qaProps = {
    setFieldValue,
    handleChange,
    options,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Box className={classes.root}>
      <Typography variant="h3">Security Questions</Typography>
      <Typography variant="body1" className={classes.copy}>
        Adding security questions helps keep your account secure and will only
        be used to verify your identity when you call Linode support. Choose
        answers that are not easily guessed or discoverable through research.
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit}>
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[0]}
          index={0}
          edit={questionEditStates[0]}
          onEdit={() => onEdit(0)}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[1]}
          index={1}
          edit={questionEditStates[1]}
          onEdit={() => onEdit(1)}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={values.security_questions[2]}
          index={2}
          edit={questionEditStates[2]}
          onEdit={() => onEdit(2)}
          {...qaProps}
        />
        <Box
          display="flex"
          justifyContent="flex-end"
          className={classes.buttonContainer}
        >
          {hasSecurityQuestionsCompleted &&
          questionEditStates.includes(true) ? (
            <Button buttonType="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
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
