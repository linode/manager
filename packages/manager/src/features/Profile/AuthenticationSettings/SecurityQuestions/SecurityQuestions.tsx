import { Box, Button, CircleProgress, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import {
  useMutateSecurityQuestions,
  useSecurityQuestions,
} from 'src/queries/profile/securityQuestions';

import { QuestionAndAnswerPair } from './QuestionAndAnswerPair';
import { getAnsweredQuestions, securityQuestionsToItems } from './utilities';

import type { SecurityQuestionsData } from '@linode/api-v4';
import type { FormikConfig } from 'formik';

export const SecurityQuestions = ({
  securityQuestionRef,
}: {
  securityQuestionRef?: React.RefObject<HTMLInputElement>;
}) => {
  const { data: securityQuestionsData, isLoading } = useSecurityQuestions();
  const {
    isPending: isUpdating,
    mutateAsync: updateSecurityQuestions,
  } = useMutateSecurityQuestions();
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
    enableReinitialize: true,
    initialValues: initalFormValues,
    onSubmit: async (values) => {
      try {
        const action = hasSecurityQuestionsCompleted ? 'updated' : 'added';
        await updateSecurityQuestions({
          security_questions: values.security_questions.map((item) => ({
            question_id: item.id,
            response: item.response as string,
          })),
        });
        enqueueSnackbar(`Successfully ${action} your security questions`, {
          variant: 'success',
        });
        onCancel();
      } catch (e) {
        enqueueSnackbar(e[0].reason, { variant: 'error' });
      }
    },
  };

  const [questionEditStates, setQuestionEditStates] = React.useState<boolean[]>(
    hasSecurityQuestionsCompleted ? [false, false, false] : [true, true, true]
  );

  React.useEffect(() => {
    if (
      hasSecurityQuestionsCompleted !==
      questionEditStates.includes(!hasSecurityQuestionsCompleted)
    ) {
      setQuestionEditStates(
        hasSecurityQuestionsCompleted
          ? [false, false, false]
          : [true, true, true]
      );
    }
  }, [hasSecurityQuestionsCompleted]);

  const onEdit = (index: number) => {
    setQuestionEditStates((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const onCancel = () => {
    resetForm();
    setQuestionEditStates([false, false, false]);
  };

  const {
    dirty,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    values,
  } = useFormik(formikConfig);

  const isButtonDisabled =
    !dirty ||
    values.security_questions.length === 0 ||
    values.security_questions.some(
      (questionResponse) => !questionResponse?.response
    );

  const qaProps = {
    handleChange,
    setFieldValue,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Box>
      <Typography variant="h3">Security Questions</Typography>
      <StyledCopy variant="body1">
        Security questions enable you to regain access to your Cloud Manager
        user account in certain situations, such as when 2FA is enabled and you
        no longer have access to the token or recovery codes. Answers to
        security questions should not be easily guessed or discoverable through
        research.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/security-controls-for-user-accounts#security-questions">
          Learn more about security options.
        </Link>
      </StyledCopy>
      <StyledForm onSubmit={handleSubmit}>
        <QuestionAndAnswerPair
          options={options.filter((option) => {
            return (
              option.value !== values.security_questions[1]?.id &&
              option.value !== values.security_questions[2]?.id
            );
          })}
          edit={questionEditStates[0]}
          index={0}
          onEdit={() => onEdit(0)}
          questionResponse={values.security_questions[0]}
          securityQuestionRef={securityQuestionRef}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          options={options.filter((option) => {
            return (
              option.value !== values.security_questions[0]?.id &&
              option.value !== values.security_questions[2]?.id
            );
          })}
          edit={questionEditStates[1]}
          index={1}
          onEdit={() => onEdit(1)}
          questionResponse={values.security_questions[1]}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          options={options.filter((option) => {
            return (
              option.value !== values.security_questions[0]?.id &&
              option.value !== values.security_questions[1]?.id
            );
          })}
          edit={questionEditStates[2]}
          index={2}
          onEdit={() => onEdit(2)}
          questionResponse={values.security_questions[2]}
          {...qaProps}
        />
        <StyledButtonContainer display="flex" justifyContent="flex-end">
          {hasSecurityQuestionsCompleted &&
          questionEditStates.includes(true) ? (
            <Button buttonType="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button
            buttonType="primary"
            disabled={isButtonDisabled}
            loading={isUpdating}
            type="submit"
          >
            {`${
              hasSecurityQuestionsCompleted ? 'Update' : 'Add'
            } Security Questions`}
          </Button>
        </StyledButtonContainer>
      </StyledForm>
    </Box>
  );
};

const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(),
  maxWidth: 960,
}));

const StyledForm = styled('form', {
  label: 'StyledForm',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
}));

const StyledButtonContainer = styled(Box, {
  label: 'StyledButtonContainer',
})(({ theme }) => ({
  gap: theme.spacing(),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(2),
  },
}));
