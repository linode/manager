import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(),
    paddingLeft: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: theme.spacing(),
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
  },
  text: {
    fontSize: '1rem',
  },
}));

interface Props {
  preferenceKey: string;
  children: JSX.Element;
  className?: string;
}

export const DismissibleBanner: React.FC<Props> = (props) => {
  const { className, preferenceKey } = props;
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();
  const classes = useStyles();

  if (hasDismissedNotifications([preferenceKey])) {
    return null;
  }

  const handleDismiss = () => {
    dismissNotifications([preferenceKey]);
  };

  return (
    <Paper className={`${classes.root} ${className || ''}`}>
      {props.children}
      <button
        aria-label={`Dismiss ${preferenceKey} banner`}
        className={classes.button}
        onClick={handleDismiss}
      >
        <Close />
      </button>
    </Paper>
  );
};

export default DismissibleBanner;
