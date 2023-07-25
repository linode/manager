import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { localStorageWarning } from 'src/features/Kubernetes/kubeUtils';
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

  const { error, isLoading, mutateAsync } = useRecycleNodeMutation(
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
        Recycle
      </Button>
    </ActionsPanel>
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
        This node will be deleted and a new node will be created to replace it.{' '}
        {localStorageWarning} This may take several minutes.
      </Typography>
    </ConfirmationDialog>
  );
};
