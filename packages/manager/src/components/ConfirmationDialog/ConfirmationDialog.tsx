import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';

import type { DialogProps } from '@mui/material/Dialog';

export interface ConfirmationDialogProps extends DialogProps {
  actions?: ((props: any) => JSX.Element) | JSX.Element;
  error?: JSX.Element | string;
  onClose: () => void;
  onExited?: () => void;
  title: string;
}

/**
 * A Confirmation Dialog is used for confirming a simple task.
 *
 * > If you are confirming a delete action, use a `Deletion Dialog`
 *
 * ### Language
 * - Avoid “Are you sure?” language. Assume the user knows what they want to do while helping them avoid unintended consequences.
 *
 */
export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    actions,
    children,
    error,
    onClose,
    onExited,
    onSubmit,
    title,
    ...dialogProps
  } = props;

  return (
    <StyledDialog
      {...dialogProps}
      TransitionProps={{
        ...dialogProps.TransitionProps,
        onExited,
      }}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          onSubmit?.(e);
        }
      }}
      PaperProps={{ role: undefined }}
      component="form"
      data-qa-dialog
      data-qa-drawer
      data-testid="drawer"
      onSubmit={onSubmit}
      role="dialog"
    >
      <DialogTitle onClose={onClose} title={title} />
      <StyledDialogContent data-qa-dialog-content>
        {children}
        {error && <StyledErrorText>{error}</StyledErrorText>}
      </StyledDialogContent>
      <StyledDialogActions>
        {actions && typeof actions === 'function'
          ? actions(dialogProps)
          : actions}
      </StyledDialogActions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog, {
  label: 'StyledDialog',
})({
  '& .MuiDialogTitle-root': {
    marginBottom: '10px',
  },
});

const StyledDialogActions = styled(DialogActions, {
  label: 'StyledDialogActions',
})({
  '& button': {
    marginBottom: 0,
  },
  justifyContent: 'flex-end',
});

const StyledDialogContent = styled(DialogContent, {
  label: 'StyledDialogContent',
})({
  display: 'flex',
  flexDirection: 'column',
});

const StyledErrorText = styled(DialogContentText, {
  label: 'StyledErrorText',
})(({ theme }) => ({
  color: theme.palette.error.dark,
  marginTop: theme.spacing(2),
}));
