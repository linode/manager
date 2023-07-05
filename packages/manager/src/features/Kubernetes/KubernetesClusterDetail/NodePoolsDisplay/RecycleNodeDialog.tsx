import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { localStorageWarning } from 'src/features/Kubernetes/kubeUtils';
import { useRecycleNodeMutation } from 'src/queries/kubernetes';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  clusterId: number;
}

export const RecycleNodeDialog = (props: Props) => {
  const { open, onClose, nodeId, clusterId } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useRecycleNodeMutation(
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
      style={{ padding: 0 }}
      primary
      primaryButtonDataTestId="confirm"
      primaryButtonHandler={onSubmit}
      primaryButtonLoading={isLoading}
      primaryButtonText="Recycle"
      secondary
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
  );

  return (
    <ConfirmationDialog
      open={open}
      title={`Recycle ${nodeId}?`}
      onClose={onClose}
      actions={actions}
      error={error?.[0].reason}
    >
      <Typography>
        This node will be deleted and a new node will be created to replace it.{' '}
        {localStorageWarning} This may take several minutes.
      </Typography>
    </ConfirmationDialog>
  );
};
