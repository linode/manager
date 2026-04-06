import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { SINGLE_NODE_POD_RECYCLE_WARNING } from 'src/features/Kubernetes/constants';
import { useRecycleNodeMutation } from 'src/queries/kubernetes';

import { LocalStorageWarningNotice } from '../LocalStorageWarningNotice';

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
        Delete and recreate this node. {SINGLE_NODE_POD_RECYCLE_WARNING}{' '}
        Consider draining this node first.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools#recycle-nodes">
          Learn more
        </Link>
        .
      </Typography>
      <LocalStorageWarningNotice />
    </ConfirmationDialog>
  );
};
