import * as React from 'react';
import Dialog, { DialogProps } from 'src/components/core/Dialog';
import DialogActions from 'src/components/core/DialogActions';
import DialogContent from 'src/components/core/DialogContent';
import DialogContentText from 'src/components/core/DialogContentText';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';

const useStyles = makeStyles()((theme: Theme) => ({
  actions: {
    '& button': {
      marginBottom: 0,
    },
    justifyContent: 'flex-end',
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
  error?: string | JSX.Element;
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
      className={classes.root}
      PaperProps={{ role: undefined }}
      role="dialog"
      data-qa-drawer
      data-qa-dialog
      data-testid="drawer"
    >
      <DialogTitle title={title} onClose={onClose} />
      <DialogContent data-qa-dialog-content className="dialog-content">
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
