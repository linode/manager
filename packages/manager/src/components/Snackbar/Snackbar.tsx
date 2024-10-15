import { styled } from '@mui/material/styles';
import { MaterialDesignContent, closeSnackbar } from 'notistack';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';

import { CloseSnackbar } from './CloseSnackbar';

import type { Theme } from '@mui/material/styles';
import type { SnackbarProviderProps } from 'notistack';

const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  ({ theme }: { theme: Theme }) => ({
    '&.notistack-MuiContent': {
      color: theme.notificationToast.default.color,
      flexWrap: 'unset',
      [theme.breakpoints.up('md')]: {
        maxWidth: '400px',
      },
    },
    '&.notistack-MuiContent-default': {
      backgroundColor: theme.notificationToast.default.backgroundColor,
      borderLeft: theme.notificationToast.default.borderLeft,
    },
    '&.notistack-MuiContent-error': {
      backgroundColor: theme.notificationToast.error.backgroundColor,
      borderLeft: theme.notificationToast.error.borderLeft,
    },
    '&.notistack-MuiContent-info': {
      backgroundColor: theme.notificationToast.info.backgroundColor,
      borderLeft: theme.notificationToast.info.borderLeft,
    },
    '&.notistack-MuiContent-success': {
      backgroundColor: theme.notificationToast.success.backgroundColor,
      borderLeft: theme.notificationToast.success.borderLeft,
    },
    '&.notistack-MuiContent-warning': {
      backgroundColor: theme.notificationToast.warning.backgroundColor,
      borderLeft: theme.notificationToast.warning.borderLeft,
    },
  })
);

export const Snackbar = (props: SnackbarProviderProps) => {
  /**
   * This pattern is taken from the Notistack docs:
   * https://iamhosseindhv.com/notistack/demos#action-for-all-snackbars
   */

  const { children, ...rest } = props;

  return (
    <SnackbarProvider
      {...rest}
      Components={{
        default: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
        success: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
      }}
      action={(snackbarId) => (
        <CloseSnackbar
          onClick={() => closeSnackbar(snackbarId)}
          text="Dismiss Notification"
        />
      )}
    >
      {children}
    </SnackbarProvider>
  );
};
