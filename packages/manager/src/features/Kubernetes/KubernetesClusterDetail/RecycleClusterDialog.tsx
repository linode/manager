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
import { useRecycleClusterMutation } from 'src/queries/kubernetes';

interface Props {
  clusterId: number;
  onClose: () => void;
  open: boolean;
}

export const RecycleClusterDialog = (props: Props) => {
  const { clusterId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync } = useRecycleClusterMutation(
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
        onClick={onSubmit}
      >
        Recycle All Cluster Nodes
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Recycle all nodes in cluster?"
    >
      <Typography>
        {nodesDeletionWarning} {localStorageWarning} This may take several
        minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};
