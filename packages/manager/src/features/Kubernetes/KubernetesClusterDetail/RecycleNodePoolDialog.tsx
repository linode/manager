import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { MULTI_NODE_POD_RECYCLE_WARNING } from 'src/features/Kubernetes/constants';
import { useRecycleNodePoolMutation } from 'src/queries/kubernetes';

import { LocalStorageWarningNotice } from './LocalStorageWarningNotice';

interface Props {
  clusterId: number;
  nodePoolId: number;
  onClose: () => void;
  open: boolean;
}

export const RecycleNodePoolDialog = (props: Props) => {
  const { clusterId, nodePoolId, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useRecycleNodePoolMutation(
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
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Recycle Pool Nodes',
        loading: isPending,
        onClick: onRecycle,
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
      title="Recycle node pool?"
    >
      <Typography>
        Delete and recreate all nodes in this node pool.{' '}
        {MULTI_NODE_POD_RECYCLE_WARNING} Consider draining the node pool first.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools#recycle-nodes">
          Learn more
        </Link>
        .
      </Typography>

      <LocalStorageWarningNotice />
    </ConfirmationDialog>
  );
};
