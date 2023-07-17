import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import Dialog, { DialogProps } from 'src/components/core/Dialog';
import DialogActions from 'src/components/core/DialogActions';
import DialogContent from 'src/components/core/DialogContent';
import DialogContentText from 'src/components/core/DialogContentText';

const useStyles = makeStyles()((theme: Theme) => ({
  actions: {
    '& button': {
      marginBottom: 0,
    },
    justifyContent: 'flex-end',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  error: {
    color: '#C44742',
    marginTop: theme.spacing(2),
  },
  root: {
    '& .MuiDialogTitle-root': {
      marginBottom: 10,
    },
  },
}));

export interface ConfirmationDialogProps extends DialogProps {
  actions?: ((props: any) => JSX.Element) | JSX.Element;
  error?: JSX.Element | string;
  onClose: () => void;
  title: string;
}

export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { classes } = useStyles();

  const { actions, children, error, onClose, title, ...dialogProps } = props;

  return (
    <Dialog
      {...dialogProps}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      PaperProps={{ role: undefined }}
      className={classes.root}
      data-qa-dialog
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
    >
      <DialogTitle onClose={onClose} title={title} />
      <DialogContent className={classes.dialogContent} data-qa-dialog-content>
        {children}
        {error && (
          <DialogContentText className={`${classes.error} error-for-scroll`}>
            {error}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        {actions && typeof actions === 'function'
          ? actions(dialogProps)
          : actions}
      </DialogActions>
    </Dialog>
  );
};
