import * as React from 'react';
import { SecurityQuestion } from '@linode/api-v4/lib/profile';
import Box from 'src/components/core/Box';
import Question from './Question';
import Answer from './Answer';
import { makeStyles, Theme } from 'src/components/core/styles';
import { Item } from 'src/components/EnhancedSelect';

interface Props {
  questionResponse?: SecurityQuestion;
  isQuestionLoading: boolean;
  index: number;
  setFieldValue: (field: string, value: string) => void;
  options: Item<number>[];
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexBasis: 'flex-start',
    minHeight: '74px',
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
    flexShrink: 1.5,
  },
  answer: {
    paddingLeft: theme.spacing(5.75),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
}));

const QuestionAndAnswerPair = (props: Props) => {
  const { questionResponse, index, options, ...rest } = props;
  const initalReaOnlyState = questionResponse ? true : false;
  const [isReadOnly, setIsReadOnly] = React.useState(initalReaOnlyState);
  const classes = useStyles();
  const disableReadOnly = () => {
    setIsReadOnly(false);
  };

  if (questionResponse === undefined) {
    return null;
  }

  return (
    <Box className={classes.root}>
      <Box
        className={classes.question}
        style={{ paddingTop: isReadOnly ? '16px' : 0 }}
      >
        <Question
          questionResponse={questionResponse}
          isReadOnly={isReadOnly}
          onClickEdit={disableReadOnly}
          options={options}
          {...rest}
        />
      </Box>
      <Box className={classes.answer}>
        <Answer isReadOnly={isReadOnly} name={`answer-${index}`} {...rest} />
      </Box>
    </Box>
  );
};

export default QuestionAndAnswerPair;
