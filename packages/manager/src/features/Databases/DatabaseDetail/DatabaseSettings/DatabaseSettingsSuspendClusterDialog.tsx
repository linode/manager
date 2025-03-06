import { Checkbox, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useSuspendDatabaseMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Engine } from '@linode/api-v4/lib/databases';

export interface SuspendDialogProps {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsSuspendClusterDialog = (
  props: SuspendDialogProps
) => {
  const { databaseEngine, databaseId, databaseLabel, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: suspendDatabase,
    reset,
  } = useSuspendDatabaseMutation(databaseEngine, databaseId);

  const defaultError = 'There was an error suspending this Database Cluster.';
  const [hasConfirmed, setHasConfirmed] = React.useState(false);
  const { push } = useHistory();

  const onSuspendCluster = async () => {
    try {
      await suspendDatabase();
      enqueueSnackbar('Database Cluster suspended successfully.', {
        variant: 'success',
      });
      onClose();
      push('/databases');
    } catch (error) {
      enqueueSnackbar('Failed to suspend Database Cluster. Please try again.', {
        variant: 'error',
      });
    } finally {
      setHasConfirmed(false);
    }
  };

  const onCancel = () => {
    onClose();
    reset();
    setHasConfirmed(false);
  };

  const SUSPENDED_CLUSTER_COPY =
    "A suspended cluster stops immediately and you won't be billed for it. You can resume the cluster within 180 days from its suspension. After that time, the cluster will be deleted permanently.";

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: !hasConfirmed,
        label: 'Suspend Cluster',
        loading: isPending,
        onClick: onSuspendCluster,
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        onClick: onCancel,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      error={
        error ? getAPIErrorOrDefault(error, defaultError)[0].reason : undefined
      }
      actions={actions}
      maxWidth="sm"
      onClose={onClose}
      open={open}
      title={`Suspend ${databaseLabel} cluster?`}
    >
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <b>{SUSPENDED_CLUSTER_COPY}</b>
        </Typography>
      </Notice>
      <Checkbox
        checked={hasConfirmed}
        onChange={() => setHasConfirmed((confirmed) => !confirmed)}
        text="I understand the effects of this action."
      />
    </ConfirmationDialog>
  );
};
