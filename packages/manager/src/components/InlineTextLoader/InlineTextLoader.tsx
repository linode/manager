import ErrorOutline from '@material-ui/icons/ErrorOutline';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

interface InlineTextLoaderProps {
  loading: boolean;
  text?: string;
  error?: string;
}

const useInlineTextLoaderStyles = makeStyles((theme: Theme) => ({
  loadingContainer: {
    '& circle': {
      stroke: theme.color.blue
    }
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    color: theme.color.red,
    margin: '0 8px 0 8px',
    fontSize: 18
  }
}));

const InlineTextLoader: React.FC<InlineTextLoaderProps> = props => {
  const classes = useInlineTextLoaderStyles();

  if (props.loading) {
    return (
      <span className={classes.loadingContainer}>
        <CircleProgress mini tag />
      </span>
    );
  }

  if (props.error) {
    return (
      <span className={classes.errorContainer}>
        <ErrorOutline className={classes.icon} />
        <Typography>{props.error}</Typography>
      </span>
    );
  }

  if (props.text) {
    return <Typography>{props.text}</Typography>;
  }

  return null;
};

export default InlineTextLoader;
