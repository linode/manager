import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';

interface Props {
  open: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
}

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onSubmit: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSubmit}
        loading={loading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle Pool Nodes
      </Button>
    </ActionsPanel>
  );
};

const RecycleAllPoolNodesDialog: React.FC<Props> = (props) => {
  const { error, loading, open, onClose, onSubmit } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Recycle node pool?"
      onClose={onClose}
      actions={() => renderActions(loading, onClose, onSubmit)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        {nodesDeletionWarning} {localStorageWarning} This may take several
        minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(RecycleAllPoolNodesDialog);
