import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDeleteNodePoolMutation } from 'src/queries/kubernetes';
import { pluralize } from 'src/utilities/pluralize';

interface Props {
  kubernetesClusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const DeleteNodePoolDialog = (props: Props) => {
  const { kubernetesClusterId, nodePool, onClose, open } = props;

  const { error, isLoading, mutateAsync } = useDeleteNodePoolMutation(
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
        onClick={onDelete}
      >
        Delete
      </Button>
    </ActionsPanel>
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
        Are you sure you want to delete this Node Pool?{' '}
        {nodeCount > 0 &&
          `${pluralize('node', 'nodes', nodeCount)} will be deleted.`}
      </Typography>
    </ConfirmationDialog>
  );
};
