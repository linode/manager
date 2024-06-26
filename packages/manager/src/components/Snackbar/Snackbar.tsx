import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CloseSnackbar } from './CloseSnackbar';

import type { Theme } from '@mui/material/styles';
import type { SnackbarProviderProps } from 'notistack';

const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  ({ theme }: { theme: Theme }) => ({
    '&.notistack-MuiContent-error': {
      backgroundColor: theme.palette.error.light,
      borderLeft: `6px solid ${theme.palette.error.dark}`,
    },
    '&.notistack-MuiContent-info': {
      backgroundColor: theme.palette.info.light,
      borderLeft: `6px solid ${theme.palette.primary.main}`,
    },
    '&.notistack-MuiContent-success': {
      backgroundColor: theme.palette.success.light,
      borderLeft: `6px solid ${theme.palette.success.dark}`,
    },
    '&.notistack-MuiContent-warning': {
      backgroundColor: theme.palette.warning.light,
      borderLeft: `6px solid ${theme.palette.warning.dark}`,
    },
  })
);

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& div': {
      backgroundColor: `transparent`,
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
}));

export const Snackbar = (props: SnackbarProviderProps) => {
  const { classes } = useStyles();
  /**
   * This pattern is taken from the Notistack docs:
   * https://iamhosseindhv.com/notistack/demos#action-for-all-snackbars
   */
  const notistackRef: React.Ref<SnackbarProvider> = React.createRef();
  const onClickDismiss = (key: number | string | undefined) => () => {
    if (notistackRef.current) {
      notistackRef.current.closeSnackbar(key);
    }
  };

  const { children, ...rest } = props;

  return (
    <SnackbarProvider
      ref={notistackRef}
      {...rest}
      Components={{
        error: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
        success: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
      }}
      action={(key) => (
        <CloseSnackbar
          onClick={onClickDismiss(key)}
          text="Dismiss Notification"
        />
      )}
      classes={{
        root: classes.root,
      }}
    >
      {children}
    </SnackbarProvider>
  );
};
