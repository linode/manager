import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import InputLabel from 'src/components/core/InputLabel';

interface Props {
  question: string;
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
}));

const AnsweredQuestion = (props: Props) => {
  const { question } = props;
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <InputLabel>Question 1</InputLabel>
      <Typography variant="body1">{question}</Typography>{' '}
      <Button buttonType="secondary" compact>
        Edit
      </Button>
    </Box>
  );
};

export default AnsweredQuestion;
