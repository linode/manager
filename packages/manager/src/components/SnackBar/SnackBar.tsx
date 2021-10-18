import {
  SnackbarProvider,
  SnackbarProviderProps,
  WithSnackbarProps,
} from 'notistack';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import CloseSnackbar from './CloseSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& span': {
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
    },
  },
  info: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.primary.main,
  },
  success: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.primary.main,
  },
  error: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.status.errorDark,
  },
  warning: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.status.warningDark,
  },
}));

type CombinedProps = SnackbarProviderProps;

const SnackBar: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  /**
   * This pattern is taken from the Notistack docs:
   * https://iamhosseindhv.com/notistack/demos#action-for-all-snackbars
   */
  const notistackRef: React.Ref<WithSnackbarProps> = React.createRef();
  const onClickDismiss = (key: string | number | undefined) => () => {
    notistackRef?.current?.closeSnackbar(key);
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
