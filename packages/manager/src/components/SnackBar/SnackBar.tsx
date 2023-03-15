import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import CloseSnackbar from './CloseSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& div': {
      backgroundColor: `${theme.bg.white} !important`,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
    },
  },
  info: {
    borderLeft: `6px solid ${theme.palette.primary.main}`,
  },
  success: {
    borderLeft: `6px solid ${theme.palette.primary.main}`,
  },
  error: {
    borderLeft: `6px solid ${theme.palette.error.dark}`,
  },
  warning: {
    borderLeft: `6px solid ${theme.palette.warning.dark}`,
  },
}));

type CombinedProps = SnackbarProviderProps;

const SnackBar: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
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

export default SnackBar;
