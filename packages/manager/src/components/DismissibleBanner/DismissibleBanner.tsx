import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Grid from 'src/components/Grid';
import Notice, { NoticeProps } from 'src/components/Notice';
import { SxProps } from '@mui/system';
import useDismissibleNotifications, {
  DismissibleNotificationOptions,
} from 'src/hooks/useDismissibleNotifications';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    borderRadius: 1,
    marginBottom: theme.spacing(),
    padding: theme.spacing(2),
    background: theme.bg.bgPaper,
  },
  closeIcon: {
    ...theme.applyLinkStyles,
    display: 'flex',
    color: theme.textColors.tableStatic,
    marginLeft: 20,
  },
}));

interface Props {
  preferenceKey: string;
  children: JSX.Element;
  className?: string;
  options?: DismissibleNotificationOptions;
  sx?: SxProps;
}

type CombinedProps = Props & Partial<NoticeProps>;

export const DismissibleBanner = (props: CombinedProps) => {
  const { className, preferenceKey, options, children, ...rest } = props;
  const { classes, cx } = useStyles();

  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    preferenceKey,
    options
  );

  if (hasDismissedBanner) {
    return null;
  }

  const dismissibleButton = (
    <Grid item>
      <button
        className={classes.closeIcon}
        aria-label={`Dismiss ${preferenceKey} banner`}
        onClick={handleDismiss}
        data-testid="notice-dismiss"
      >
        <Close />
      </button>
    </Grid>
  );

  return (
    <Notice
      className={cx(classes.root, className)}
      dismissibleButton={dismissibleButton}
      {...rest}
    >
      {children}
    </Notice>
  );
};

export default DismissibleBanner;

// Hook that contains the nuts-and-bolts of the DismissibleBanner component.
// Extracted out as its own hook so other components can use it.
export const useDismissibleBanner = (
  preferenceKey: string,
  options?: DismissibleNotificationOptions
) => {
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const hasDismissedBanner = hasDismissedNotifications([preferenceKey]);

  const handleDismiss = () => {
    dismissNotifications([preferenceKey], options);
  };

  return { hasDismissedBanner, handleDismiss };
};
