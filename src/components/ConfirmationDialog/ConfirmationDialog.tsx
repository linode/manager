import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Dialog, { DialogProps, DialogContentText } from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';

type ClassNames = 'root' | 'error';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  error: {
    color: '#C44742',
    marginTop: theme.spacing.unit * 2,
  },
});

interface Props extends DialogProps {
  actions: (props: any) => JSX.Element;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ConfirmationDialog: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    title,
    classes,
    children,
    actions,
    error,
    ...dialogProps,
  } = props;
  return (
    <Dialog
      { ...dialogProps }
      disableBackdropClick={true}
    >
      <DialogTitle id="alert-dialog-title" data-qa-dialog-title>{title}</DialogTitle>
      <DialogContent data-qa-dialog-content>
        { children }
      { error &&
        <DialogContentText className={`${classes.error} error-for-scroll`}>
          { error }
        </DialogContentText>
      }
      </DialogContent>
      <DialogActions>
        { actions(dialogProps) }
      </DialogActions>
    </Dialog>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(ConfirmationDialog);
