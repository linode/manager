import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

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
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        loading={loading}
        onClick={onSubmit}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle Cluster
      </Button>
    </ActionsPanel>
  );
};

const RecycleAllClusterNodesDialog: React.FC<Props> = props => {
  const { error, loading, open, onClose, onSubmit } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Recycle all nodes in cluster?"
      onClose={onClose}
      actions={() => renderActions(loading, onClose, onSubmit)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Are you sure you want to recycle this cluster? All nodes will be deleted
        and new nodes will be created to replace them. Any local storage (such
        as &apos;hostPath&apos; volumes) will be erased. This may take several
        minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(RecycleAllClusterNodesDialog);
