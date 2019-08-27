import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

type ClassNames = 'warningCopy';

const styles = (theme: Theme) =>
  createStyles({
    warningCopy: {
      color: theme.color.red,
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  open: boolean;
  mode: 'detach' | 'delete';
  error?: string;
  onClose: () => void;
  onDetach: () => void;
  onDelete: () => void;
  volumeLabel: string;
  linodeLabel: string;
  poweredOff: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DestructiveVolumeDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    const method = {
      detach: this.props.onDetach,
      delete: this.props.onDelete
    }[this.props.mode];

    const action = {
      detach: 'Detach',
      delete: 'Delete'
    }[this.props.mode];

    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button buttonType="cancel" onClick={this.props.onClose} data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={method}
          data-qa-confirm
        >
          {action}
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const {
      classes,
      error,
      volumeLabel: label,
      linodeLabel,
      poweredOff,
      mode
    } = this.props;
    const title = {
      detach: `Detach ${label ? label : 'Volume'}?`,
      delete: `Delete ${label ? label : 'Volume'}?`
    }[this.props.mode];

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`${title}`}
        onClose={this.props.onClose}
        actions={this.renderActions}
      >
        {error && <Notice error text={error} />}

        {/* In 'detach' mode, show a warning if the Linode is powered on. */}
        {mode === 'detach' && !poweredOff && (
          <Typography className={classes.warningCopy}>
            <strong>Warning:</strong> This operation could cause data loss.
            Please power off the Linode first or make sure it isn't currently
            writing to the volume before continuing. If this volume is currently
            mounted, detaching it could cause your Linode to restart.
          </Typography>
        )}

        <Typography>
          Are you sure you want to {mode} this Volume
          {`${linodeLabel ? ` from ${linodeLabel}?` : '?'}`}
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default withStyles(styles)(DestructiveVolumeDialog);
