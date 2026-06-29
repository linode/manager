import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Stream } from '@linode/api-v4';

interface DisableLoggingInClusterDialogProps {
  clusterName: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  streamsUsingCluster: Stream[];
}

export const DisableLoggingDialog = React.memo(
  (props: DisableLoggingInClusterDialogProps) => {
    const {
      clusterName,
      isPending,
      onClose,
      onConfirm,
      open,
      streamsUsingCluster,
    } = props;

    const affectedStreamLabels = streamsUsingCluster.map(({ label }) => label);

    return (
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Disable anyway',
              loading: isPending,
              onClick: onConfirm,
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        }
        onClose={onClose}
        open={open}
        title="Disable logging for cluster?"
      >
        <Typography>
          Disabling logging for <b>{clusterName}</b> will interrupt other active
          streams that rely on it and may impact provisioning. The following
          streams will be affected: <b>{affectedStreamLabels.join(', ')}</b>.
        </Typography>
      </ConfirmationDialog>
    );
  }
);
