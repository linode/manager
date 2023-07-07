import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import CloseSnackbar from './CloseSnackbar';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& div': {
      backgroundColor: `${theme.bg.white} !important`,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
    },
    [theme.breakpoints.down('md')]: {
      '& .SnackbarItem-contentRoot': {
        flexWrap: 'nowrap',
      },
      '& .SnackbarItem-message': {
        display: 'unset',
      },
    },
    [theme.breakpoints.down('sm')]: {
      '& .SnackbarItem-action': {
        paddingLeft: 0,
      },
    },
  },
  info: {
    borderLeft: `6px solid ${theme.palette.primary.main}`,
  },
  success: {
    borderLeft: `6px solid ${theme.color.green}`,
  },
  error: {
    borderLeft: `6px solid ${theme.palette.error.dark}`,
  },
  warning: {
    borderLeft: `6px solid ${theme.palette.warning.dark}`,
  },
}));

export const Snackbar = (props: SnackbarProviderProps) => {
  const { classes } = useStyles();
  /**
   * This pattern is taken from the Notistack docs:
   * https://iamhosseindhv.com/notistack/demos#action-for-all-snackbars
   */
  const notistackRef: React.Ref<SnackbarProvider> = React.createRef();
  const onClickDismiss = (key: string | number | undefined) => () => {
    if (notistackRef.current) {
      notistackRef.current.closeSnackbar(key);
    }
  };

  const { children, ...rest } = props;

  return (
    <SnackbarProvider
      ref={notistackRef}
      {...rest}
      classes={{
        root: classes.root,
        variantSuccess: classes.success,
        variantError: classes.error,
        variantWarning: classes.warning,
        variantInfo: classes.info,
      }}
      action={(key) => (
        <CloseSnackbar
          onClick={onClickDismiss(key)}
          text="Dismiss Notification"
        />
      )}
    >
      {children}
    </SnackbarProvider>
  );
};
