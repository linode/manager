import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { localStorageWarning } from 'src/features/Kubernetes/kubeUtils';
import { useRecycleNodeMutation } from 'src/queries/kubernetes';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  clusterId: number;
}

export const RecycleNodeDialog = (props: Props) => {
  const { open, onClose, nodeId, clusterId } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useRecycleNodeMutation(
    clusterId,
    nodeId
  );

  const onSubmit = () => {
    mutateAsync().then(() => {
      enqueueSnackbar('Node queued for recycling.', { variant: 'success' });
    });
  };

  const actions = (
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
        loading={isLoading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title={`Recycle ${nodeId}?`}
      onClose={onClose}
      actions={actions}
      error={error?.[0].reason}
    >
      <Typography>
        This node will be deleted and a new node will be created to replace it.{' '}
        {localStorageWarning} This may take several minutes.
      </Typography>
    </ConfirmationDialog>
  );
};
