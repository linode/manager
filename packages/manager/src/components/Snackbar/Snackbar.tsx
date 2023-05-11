import * as React from 'react';
import CloseSnackbar from './CloseSnackbar';
import {
  MaterialDesignContent,
  SnackbarProvider,
  SnackbarProviderProps,
} from 'notistack';
import { styled } from '@mui/material/styles';

const StyledVariants = styled(MaterialDesignContent)(({ theme }) => ({
  '&.notistack-MuiContent': {
    backgroundColor: `${theme.bg.white}`,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
  },
  '&.notistack-MuiContent-error': {
    borderLeft: `6px solid ${theme.palette.error.dark}`,
  },
  '&.notistack-MuiContent-info': {
    borderLeft: `6px solid ${theme.palette.primary.main}`,
  },
  '&.notistack-MuiContent-success': {
    borderLeft: `6px solid ${theme.palette.primary.main}`, // TODO: UX is revisiting whether this should be 'green'
  },
  '&.notistack-MuiContent-warning': {
    borderLeft: `6px solid ${theme.palette.warning.dark}`,
  },
}));

interface CustomSnackbarProps extends SnackbarProviderProps {
  'data-qa-toast'?: boolean;
}

export const Snackbar = (props: SnackbarProviderProps) => {
  const { children, ...rest } = props;

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

  return (
    <SnackbarProvider
      {...rest}
      ref={notistackRef}
      SnackbarProps={{ 'data-qa-toast': true } as CustomSnackbarProps}
      action={(key) => (
        <CloseSnackbar
          onClick={onClickDismiss(key)}
          text="Dismiss Notification"
        />
      )}
      Components={{
        default: StyledVariants,
        error: StyledVariants,
        info: StyledVariants,
        success: StyledVariants,
        warning: StyledVariants,
      }}
    >
      {children}
    </SnackbarProvider>
  );
};
