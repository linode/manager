import Close from '@material-ui/icons/Close';
import classNames from 'classnames';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    borderRadius: 1,
    marginBottom: theme.spacing(),
    padding: '12px 18px',
    '& p': {
      fontSize: '1rem',
      marginLeft: theme.spacing(),
    },
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
    color: theme.textColors.tableStatic,
    marginLeft: 20,
  },
  productInformationIndicator: {
    borderLeft: `solid 6px ${theme.palette.primary.main}`,
  },
}));

interface Props {
  preferenceKey: string;
  children: JSX.Element;
  className?: string;
  productInformationIndicator?: boolean;
}

export const DismissibleBanner: React.FC<Props> = (props) => {
  const { className, preferenceKey, productInformationIndicator } = props;
  const classes = useStyles();

  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    preferenceKey
  );

  if (hasDismissedBanner) {
    return null;
  }

  return (
    <Paper
      className={classNames(
        {
          [classes.root]: true,
          [classes.productInformationIndicator]: productInformationIndicator,
        },
        className
      )}
    >
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

// Hook that contains the nuts-and-bolts of the DismissibleBanner component.
// Extracted out as its own hook so other components can use it.
export const useDismissibleBanner = (preferenceKey: string) => {
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const hasDismissedBanner = hasDismissedNotifications([preferenceKey]);

  const handleDismiss = () => {
    dismissNotifications([preferenceKey]);
  };

  return { hasDismissedBanner, handleDismiss };
};
