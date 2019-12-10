import * as React from 'react';
import Dialog, { DialogProps } from 'src/components/core/Dialog';
import DialogActions from 'src/components/core/DialogActions';
import DialogContent from 'src/components/core/DialogContent';
import DialogContentText from 'src/components/core/DialogContentText';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DialogTitle from 'src/components/DialogTitle';

type ClassNames = 'root' | 'error' | 'actions';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    error: {
      color: '#C44742',
      marginTop: theme.spacing(2)
    },
    actions: {
      justifyContent: 'flex-end'
    }
  });

interface Props extends DialogProps {
  actions?: ((props: any) => JSX.Element) | JSX.Element;
  error?: string;
  onClose: () => void;
  title: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ConfirmationDialog: React.FC<CombinedProps> = props => {
  const { title, classes, children, actions, error, ...dialogProps } = props;

  return (
    <Dialog
      {...dialogProps}
      disableBackdropClick={true}
      PaperProps={{ role: undefined }}
      role="dialog"
    >
      <DialogTitle
        data-qa-dialog-title={title}
        className="dialog-title"
        title={title}
      />
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

const styled = withStyles(styles);

export default styled(ConfirmationDialog);
