import { Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { MULTI_NODE_POD_RECYCLE_WARNING } from 'src/features/Kubernetes/constants';
import { useRecycleClusterMutation } from 'src/queries/kubernetes';

import { LocalStorageWarningNotice } from './LocalStorageWarningNotice';

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
        Delete and recreate all nodes in this cluster.{' '}
        {MULTI_NODE_POD_RECYCLE_WARNING}{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools#recycle-nodes">
          Learn more
        </Link>
        .
      </Typography>
      <LocalStorageWarningNotice />
    </ConfirmationDialog>
  );
};
