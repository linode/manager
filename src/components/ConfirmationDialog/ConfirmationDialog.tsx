import * as React from 'react';

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root' | 'error' | 'actions';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  error: {
    color: '#C44742',
    marginTop: theme.spacing.unit * 2,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

interface Props extends DialogProps {
  actions?: (props: any) => JSX.Element;
  error?: string;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ConfirmationDialog: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    title,
    classes,
    children,
    actions,
    error,
    ...dialogProps
  } = props;
  return (
    <Dialog
      { ...dialogProps }
      disableBackdropClick={true}
    >
      <DialogTitle id="alert-dialog-title" data-qa-dialog-title className="dialog-title">{title}</DialogTitle>
      <DialogContent data-qa-dialog-content className="dialog-content">
        { children }
      { error &&
        <DialogContentText className={`${classes.error} error-for-scroll`}>
          { error }
        </DialogContentText>
      }
      </DialogContent>
      <DialogActions className={classes.actions}>
        { actions && actions(dialogProps) }
      </DialogActions>
    </Dialog>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(ConfirmationDialog);
