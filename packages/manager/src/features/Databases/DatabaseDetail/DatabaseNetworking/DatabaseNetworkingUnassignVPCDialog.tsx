import { useDatabaseMutation } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Engine, UpdateDatabasePayload } from '@linode/api-v4';
import type { Theme } from '@linode/ui';

interface Props {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseNetworkingUnassignVPCDialog = (props: Props) => {
  const { databaseEngine, databaseId, databaseLabel, onClose, open } = props;

  const navigate = useNavigate();

  const {
    error,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
    reset: resetMutation,
  } = useDatabaseMutation(databaseEngine, databaseId);

  const onUnassign = async () => {
    const payload: UpdateDatabasePayload = { private_network: null };

    updateDatabase(payload).then(() => {
      onClose();
      enqueueSnackbar('Changes are being applied.', {
        variant: 'info',
      });

      navigate({
        to: '/databases/$engine/$databaseId',
        params: {
          engine: databaseEngine,
          databaseId,
        },
      });
    });
  };

  const renderActions = (
    onClose: () => void,
    onConfirm: () => void,
    loading: boolean
  ) => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'unassign-button',
          label: 'Unassign',
          loading,
          onClick: onConfirm,
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      />
    );
  };

  const handleOnClose = () => {
    onClose();
    resetMutation?.();
  };

  return (
    <ConfirmationDialog
      actions={renderActions(handleOnClose, onUnassign, submitInProgress)}
      onClose={handleOnClose}
      open={open}
      title={`Unassign ${databaseLabel} from VPC?`}
    >
      {error && <Notice variant="error">{error[0].reason}</Notice>}
      <Typography>
        The unassignment of the VPC will cause a temporary downtime during the
        transition and will make the cluster accessible only via its public IP.
      </Typography>

      <Typography
        sx={(theme: Theme) => ({
          marginTop: theme.spacingFunction(20),
          marginBottom: theme.spacingFunction(20),
        })}
      >
        Once unassigned, review the allowed IP list to help prevent unauthorized
        access and clear DNS caches to ensure that applications resolve the new
        IP addresses correctly.
      </Typography>

      <Typography>
        Note that if you want to change the VPC assigned to the cluster, you can
        do it without unassigning the current VPC first.
      </Typography>
    </ConfirmationDialog>
  );
};
