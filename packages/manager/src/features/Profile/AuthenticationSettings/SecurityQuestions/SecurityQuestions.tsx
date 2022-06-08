import * as React from 'react';
import _ from 'lodash';
import { useFormik } from 'formik';
import { useMutateUserSecurityQuestions } from 'src/queries/securityQuestions';
import QuestionAndAnswerPair from './QuestionAndAnswerPair';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box from 'src/components/core/Box';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import { SecurityQuestionsResponse, SecurityQuestion } from '@linode/api-v4/lib/profile';
import { Item } from 'src/components/EnhancedSelect';

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

interface FormData {
  'question-1': number;
  'question-2': number;
  'question-3': number;
  'answer-1': string;
  'answer-2': string;
  'answer-3': string;
};

const getQuestionOptions = (possibleQuestions: SecurityQuestion[],selectedOptions: number[]) => {
  return possibleQuestions.reduce((acc: Item<number>[], questionObject: SecurityQuestion) => {
    const isQuestionAlreadySelected = questionObject.id === selectedOptions[0] || questionObject.id === selectedOptions[1]
    if (!isQuestionAlreadySelected) {
      acc.push({ value: questionObject.id, label: questionObject.question });
    }
    return acc;
  }, [] as Item<number>[]);
}

const formatFormData = (data: FormData, possibleQuestions: SecurityQuestion[]) => {
  const questionIDsAndAnswers = [];
  const question1 = possibleQuestions.find(question => question.id === data['question-1'])?.question || '';
  const question2 = possibleQuestions.find(question => question.id === data['question-2'])?.question || '';
  const question3 = possibleQuestions.find(question => question.id === data['question-3'])?.question || '';
  questionIDsAndAnswers.push(...[
    { id: data['question-1'], answer: data['answer-1'], question: question1},
    { id: data['question-2'], answer: data['answer-2'], question: question2},
    { id: data['question-3'], answer: data['answer-3'], question: question3},
  ]);
  return {
    security_questions: questionIDsAndAnswers,
  };
}

interface Props {
  possibleSecurityQuestionsResponse?: SecurityQuestionsResponse;
  userSecurityQuestionsResponse?: SecurityQuestionsResponse;
  isLoading: boolean;
}

const SecurityQuestions = (props: Props) => {
  const classes = useStyles();

  const { possibleSecurityQuestionsResponse, userSecurityQuestionsResponse, isLoading } = props;

  const possibleSecurityQuestionObjects = possibleSecurityQuestionsResponse?.security_questions || [];

  const { mutateAsync: updateSecurityQuestions } = useMutateUserSecurityQuestions();

  const userSecurityQuestions = userSecurityQuestionsResponse?.security_questions || [];

  const initalFormValues = {
    ['question-1']: userSecurityQuestions[0]?.id,
    ['question-2']: userSecurityQuestions[1]?.id,
    ['question-3']: userSecurityQuestions[2]?.id,
    ['answer-1']: '',
    ['answer-2']: '',
    ['answer-3']: '',
  };

  const formik = useFormik({
    initialValues: initalFormValues,
    onSubmit: async (values) => {
      try {
        const requestPayload = formatFormData(values, possibleSecurityQuestionObjects);
        console.log(requestPayload);
        await updateSecurityQuestions(requestPayload);
      } catch (e) {
        // Do something here I guess
      }
    },
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  const qaProps = {
    isQuestionLoading: isLoading,
    setFieldValue: formik.setFieldValue,
    setTouched: formik.setTouched,
  };

  const buttonCopy = userSecurityQuestions.length === 0 ? 'Add' : 'Update';

  const isButtonDisabled = false;
    // !formik.dirty || Object.values(formik.values).length !== 0;

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
          questionResponse={userSecurityQuestions[0]}
          index={1}
          options={getQuestionOptions(
            possibleSecurityQuestionObjects,
            [
              formik.values['question-2'],
              formik.values['question-3'],
            ]
          )}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={userSecurityQuestions[1]}
          index={2}
          options={getQuestionOptions(
            possibleSecurityQuestionObjects,
            [
              formik.values['question-1'],
              formik.values['question-3'],
            ]
          )}
          {...qaProps}
        />
        <QuestionAndAnswerPair
          questionResponse={userSecurityQuestions[2]}
          index={3}
          options={getQuestionOptions(
            possibleSecurityQuestionObjects,
            [
              formik.values['question-1'],
              formik.values['question-2'],
            ]
          )}
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
