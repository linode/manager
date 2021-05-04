import * as React from 'react';
import Dialog, { DialogProps } from 'src/components/core/Dialog';
import DialogActions from 'src/components/core/DialogActions';
import DialogContent from 'src/components/core/DialogContent';
import DialogContentText from 'src/components/core/DialogContentText';
import { makeStyles, Theme } from 'src/components/core/styles';
import DialogTitle from 'src/components/DialogTitle';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiPaper-root': {
      minWidth: 480,
    },
    '& .MuiDialogTitle-root': {
      marginBottom: 10,
    },
  },
  error: {
    color: '#C44742',
    marginTop: theme.spacing(2),
  },
  actions: {
    justifyContent: 'flex-end',
    '& button': {
      marginBottom: 0,
    },
  },
}));

interface Props extends DialogProps {
  actions?: ((props: any) => JSX.Element) | JSX.Element;
  error?: string | JSX.Element;
  onClose: () => void;
  title: string;
}

type CombinedProps = Props;

const ConfirmationDialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { title, children, actions, error, ...dialogProps } = props;

  return (
    <Dialog
      {...dialogProps}
      className={classes.root}
      disableBackdropClick={true}
      PaperProps={{ role: undefined }}
      role="dialog"
    >
      <DialogTitle className="dialog-title" title={title} />
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

export default ConfirmationDialog;
