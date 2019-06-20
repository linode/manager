import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  loading: boolean;
  clusterLabel: string;
  error?: string;
  onClose: () => void;
  onDelete: () => void;
}

type CombinedProps = Props;

class KubernetesDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    const { loading, onClose } = this.props;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button type="cancel" onClick={onClose} data-qa-cancel>
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          loading={loading}
          onClick={this.props.onDelete}
          data-qa-confirm
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { clusterLabel, error } = this.props;

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`Delete ${clusterLabel}`}
        onClose={this.props.onClose}
        actions={this.renderActions}
      >
        {error && <Notice error text={error} />}
        <Typography>Are you sure you want to delete {clusterLabel}?</Typography>
      </ConfirmationDialog>
    );
  }
}

export default KubernetesDialog;
