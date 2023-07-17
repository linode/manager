import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';
import { useRecycleNodePoolMutation } from 'src/queries/kubernetes';

interface Props {
  clusterId: number;
  nodePoolId: number;
  onClose: () => void;
  open: boolean;
}

export const RecycleNodePoolDialog = (props: Props) => {
  const { clusterId, nodePoolId, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync } = useRecycleNodePoolMutation(
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
        data-qa-cancel
        data-testid={'dialog-cancel'}
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-qa-confirm
        data-testid={'dialog-confirm'}
        loading={isLoading}
        onClick={onRecycle}
      >
        Recycle Pool Nodes
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Recycle node pool?"
    >
      <Typography>
        {nodesDeletionWarning} {localStorageWarning} This may take several
        minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};
