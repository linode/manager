import { Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { localStorageWarning } from 'src/features/Kubernetes/constants';
import { useRecycleClusterMutation } from 'src/queries/kubernetes';

interface Props {
  clusterId: number;
  onClose: () => void;
  open: boolean;
}

export const RecycleClusterDialog = (props: Props) => {
  const { clusterId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useRecycleClusterMutation(
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
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Recycle All Cluster Nodes',
        loading: isPending,
        onClick: onSubmit,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
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
        Redeploy all nodes in the cluster. {localStorageWarning} This may take
        several minutes, as nodes will be replaced on a rolling basis.
      </Typography>
    </ConfirmationDialog>
  );
};
