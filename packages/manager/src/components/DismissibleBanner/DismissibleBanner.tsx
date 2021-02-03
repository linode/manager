import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import usePreferences from 'src/hooks/usePreferences';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(2)}px ${theme.spacing()}px`,
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  button: {
    ...theme.applyLinkStyles
  }
}));

interface Props {
  preferenceKey: string;
  message: string;
  className?: string;
}

export const FirewallBanner: React.FC<Props> = props => {
  const { className, message, preferenceKey } = props;
  const { preferences, updatePreferences } = usePreferences();
  const classes = useStyles();

  const [hidden, setHidden] = React.useState(false);

  if (hidden || preferences?.[preferenceKey]) {
    return null;
  }

  const handleDismiss = () => {
    setHidden(true);
    updatePreferences({ [preferenceKey]: true });
  };

  return (
    <Paper className={`${classes.root} ${className || ''}`}>
      <Typography>{message}</Typography>
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

export default FirewallBanner;
