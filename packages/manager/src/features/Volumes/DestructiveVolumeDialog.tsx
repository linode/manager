import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  mode: 'detach' | 'delete';
  error?: string;
  onClose: () => void;
  onDetach: () => void;
  onDelete: () => void;
  volumeLabel: string;
  linodeLabel: string;
}

type CombinedProps = Props;

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
    const { error, volumeLabel: label, linodeLabel } = this.props;
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
        <Typography>
          Are you sure you want to {this.props.mode} this Volume
          {`${linodeLabel ? ` from ${linodeLabel}?` : '?'}`}
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default DestructiveVolumeDialog;
