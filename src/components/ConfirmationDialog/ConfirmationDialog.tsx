import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Dialog, { DialogProps } from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props extends DialogProps {
  actions: () => JSX.Element;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ConfirmationDialog: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    title,
    children,
    actions,
    ...dialogProps,
  } = props;
  return (
    <Dialog { ...dialogProps }>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        { children }
      </DialogContent>
      <DialogActions>
        { actions() }
      </DialogActions>
    </Dialog>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(ConfirmationDialog);
