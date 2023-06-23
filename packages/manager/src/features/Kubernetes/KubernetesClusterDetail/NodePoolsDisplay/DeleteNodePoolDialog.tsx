import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { pluralize } from 'src/utilities/pluralize';
import { useDeleteNodePoolMutation } from 'src/queries/kubernetes';
import { KubeNodePoolResponse } from '@linode/api-v4';

interface Props {
  kubernetesClusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  open: boolean;
  onClose: () => void;
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
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onDelete}
        loading={isLoading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title={'Delete Node Pool?'}
      onClose={onClose}
      actions={actions}
      error={error?.[0].reason}
    >
      <Typography>
        Are you sure you want to delete this Node Pool?{' '}
        {nodeCount > 0 &&
          `${pluralize('node', 'nodes', nodeCount)} will be deleted.`}
      </Typography>
    </ConfirmationDialog>
  );
};
