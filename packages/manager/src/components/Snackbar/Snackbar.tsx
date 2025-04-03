import { styled } from '@mui/material/styles';
import { MaterialDesignContent, closeSnackbar } from 'notistack';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';

import { CloseSnackbar } from './CloseSnackbar';

import {
  InfoOutlinedIcon,
  TipOutlinedIcon,
  WarningOutlinedIcon,
  ErrorOutlinedIcon,
  SuccessOutlinedIcon,
} from '@linode/ui';

import type { Theme } from '@mui/material/styles';
import type { SnackbarProviderProps } from 'notistack';

declare module 'notistack' {
  interface VariantOverrides {
    tip: true;
  }
}

const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  ({ theme }: { theme: Theme }) => ({
    '#notistack-snackbar > svg': {
      position: 'absolute',
      left: '14px',
    },
    '&.notistack-MuiContent': {
      color: theme.notificationToast.default.color,
      flexWrap: 'unset',
      borderRadius: 0,
      paddingLeft: theme.spacingFunction(12),
      paddingRight: theme.spacingFunction(12),
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
    '&.notistack-MuiContent-info, &.notistack-MuiContent-tip': {
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
    '& #notistack-snackbar + div': {
      paddingLeft: theme.spacingFunction(12),
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
      iconVariant={{
        default: <InfoOutlinedIcon />,
        info: <InfoOutlinedIcon />,
        tip: <TipOutlinedIcon />,
        warning: <WarningOutlinedIcon />,
        error: <ErrorOutlinedIcon />,
        success: <SuccessOutlinedIcon />,
      }}
      {...rest}
      Components={{
        default: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
        tip: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        success: StyledMaterialDesignContent,
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
