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
        buttonType="secondary"
        destructive
        loading={loading}
        onClick={onSubmit}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle all Nodes
      </Button>
    </ActionsPanel>
  );
};

const RecycleAllNodesDialog: React.FC<Props> = props => {
  const { error, loading, open, onClose, onSubmit } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Recycle all nodes?"
      onClose={onClose}
      actions={() => renderActions(loading, onClose, onSubmit)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Are you sure you want to recycle all nodes? All nodes belonging to the
        pool will be removed and replaced with fresh nodes.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(RecycleAllNodesDialog);
