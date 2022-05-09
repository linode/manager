import * as React from 'react';
import Box from 'src/components/core/Box';
import Question from './Question';
import Answer from './Answer';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  questionTuple: [string, string] | undefined;
  isQuestionLoading: boolean;
  index: number;
  setFieldValue: (field: string, value: string) => void;
}

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
  question: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const QuestionAndAnswerPair = (props: Props) => {
  const { questionTuple, ...rest } = props;
  const initalReaOnlyState = questionTuple ? true : false;
  const [isReadOnly, setIsReadOnly] = React.useState(initalReaOnlyState);
  const classes = useStyles();
  const disableReadOnly = () => {
    setIsReadOnly(false);
  };
  return (
    <Box className={classes.root}>
      <Box className={classes.question}>
        <Question
          question={questionTuple?.[0]}
          isReadOnly={isReadOnly}
          onClickEdit={disableReadOnly}
          {...rest}
        />
      </Box>
      <Box>
        <Answer isReadOnly={isReadOnly} {...rest} />
      </Box>
    </Box>
  );
};

export default QuestionAndAnswerPair;
