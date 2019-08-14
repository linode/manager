import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  error?: string;
  onClose: () => void;
  onDelete: () => void;
  label: string;
}

type CombinedProps = Props;

class DestructiveMonitorDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    const { onClose, onDelete } = this.props;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={onDelete}
          data-qa-confirm
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { error, label } = this.props;

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`Delete ${label}?`}
        onClose={this.props.onClose}
        actions={this.renderActions}
      >
        {error && <Notice error text={error} />}
        <Typography>Are you sure you want to delete {label}?</Typography>
      </ConfirmationDialog>
    );
  }
}

export default DestructiveMonitorDialog;
