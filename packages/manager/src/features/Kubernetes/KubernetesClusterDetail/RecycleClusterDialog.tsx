import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';
import { useRecycleClusterMutation } from 'src/queries/kubernetes';

interface Props {
  open: boolean;
  onClose: () => void;
  clusterId: number;
}

export const RecycleClusterDialog = (props: Props) => {
  const { open, onClose, clusterId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useRecycleClusterMutation(
    clusterId
  );

  const onSubmit = () => {
    mutateAsync().then(() => {
      enqueueSnackbar('All cluster nodes queued for recycling', {
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
        onClick={onSubmit}
        loading={isLoading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle All Cluster Nodes
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Recycle all nodes in cluster?"
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
