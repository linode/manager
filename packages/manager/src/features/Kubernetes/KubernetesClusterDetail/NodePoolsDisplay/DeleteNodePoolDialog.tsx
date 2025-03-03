import { Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { useDeleteNodePoolMutation } from 'src/queries/kubernetes';
import { pluralize } from 'src/utilities/pluralize';

import { localStorageWarning } from '../../constants';

import type { KubeNodePoolResponse } from '@linode/api-v4';

interface Props {
  kubernetesClusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const DeleteNodePoolDialog = (props: Props) => {
  const { kubernetesClusterId, nodePool, onClose, open } = props;

  const { error, isPending, mutateAsync } = useDeleteNodePoolMutation(
    kubernetesClusterId,
    nodePool?.id ?? -1
  );

  const onDelete = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  const nodeCount = nodePool?.count ?? 0;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Delete',
        loading: isPending,
        onClick: onDelete,
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
      title={'Delete Node Pool?'}
    >
      <Typography>
        Delete {nodeCount > 1 ? 'all' : 'the'}{' '}
        {nodeCount > 0 &&
          `${pluralize('node', 'nodes', nodeCount)} in this node pool.`}{' '}
        Any pods running on these nodes are also deleted. Consider draining the
        node pool first.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools#remove-a-node-pool">
          Learn more
        </Link>
        .
      </Typography>

      <Notice spacingTop={8} variant="warning">
        Compute Instances associated with these nodes will be deleted. Since
        using local storage is not advised, this operation is generally safe.{' '}
        {localStorageWarning}
      </Notice>
    </ConfirmationDialog>
  );
};
