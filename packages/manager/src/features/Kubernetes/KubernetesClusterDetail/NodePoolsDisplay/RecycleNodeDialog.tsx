import { Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { localStorageWarning } from 'src/features/Kubernetes/constants';
import { useRecycleNodeMutation } from 'src/queries/kubernetes';

interface Props {
  clusterId: number;
  nodeId: string;
  onClose: () => void;
  open: boolean;
}

export const RecycleNodeDialog = (props: Props) => {
  const { clusterId, nodeId, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useRecycleNodeMutation(
    clusterId,
    nodeId
  );

  const onSubmit = () => {
    mutateAsync().then(() => {
      enqueueSnackbar('Node queued for recycling.', { variant: 'success' });
      onClose();
    });
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Recycle',
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
      title={`Recycle ${nodeId}?`}
    >
      <Typography>
        Redeploy this node in the node pool. {localStorageWarning} This may take
        several minutes.
      </Typography>
    </ConfirmationDialog>
  );
};
