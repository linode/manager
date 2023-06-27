import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';
import { useRecycleNodePoolMutation } from 'src/queries/kubernetes';

interface Props {
  open: boolean;
  onClose: () => void;
  clusterId: number;
  nodePoolId: number;
}

export const RecycleNodePoolDialog = (props: Props) => {
  const { open, onClose, clusterId, nodePoolId } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useRecycleNodePoolMutation(
    clusterId,
    nodePoolId
  );

  const onRecycle = () => {
    mutateAsync().then(() => {
      enqueueSnackbar(`Recycled all nodes in node pool ${nodePoolId}`, {
        variant: 'success',
      });
      onClose();
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
        onClick={onRecycle}
        loading={isLoading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle Pool Nodes
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Recycle node pool?"
      onClose={onClose}
      actions={actions}
      error={error?.[0].reason}
    >
      <Typography>
        {nodesDeletionWarning} {localStorageWarning} This may take several
        minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};
