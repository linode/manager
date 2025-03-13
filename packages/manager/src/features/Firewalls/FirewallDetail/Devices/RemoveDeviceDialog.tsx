import { ActionsPanel, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  useRemoveFirewallDeviceMutation,
  linodeQueries,
  nodebalancerQueries,
} from '@linode/queries';

import type { FirewallDevice } from '@linode/api-v4';

export interface Props {
  device: FirewallDevice | undefined;
  firewallId: number;
  firewallLabel: string;
  onClose: () => void;
  onService: boolean | undefined;
  open: boolean;
}

export const RemoveDeviceDialog = React.memo((props: Props) => {
  const { device, firewallId, firewallLabel, onClose, onService, open } = props;

  const { enqueueSnackbar } = useSnackbar();
  const deviceType = device?.entity.type;

  const { error, isPending, mutateAsync } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const queryClient = useQueryClient();

  const deviceDialog = deviceType === 'linode' ? 'Linode' : 'NodeBalancer';

  const onDelete = async () => {
    if (!device) {
      return;
    }

    await mutateAsync();

    const toastMessage = onService
      ? `Firewall ${firewallLabel} successfully unassigned`
      : `${deviceDialog} ${device.entity.label} successfully removed`;

    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });

    if (error) {
      enqueueSnackbar(error[0].reason, { variant: 'error' });
    }

    // Since the linode was removed as a device, invalidate the linode-specific firewall query
    if (deviceType === 'linode') {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(device.entity.id)._ctx.firewalls
          .queryKey,
      });
    }

    if (deviceType === 'nodebalancer') {
      queryClient.invalidateQueries({
        queryKey: nodebalancerQueries.nodebalancer(device.entity.id)._ctx
          .firewalls.queryKey,
      });
    }

    onClose();
  };

  const dialogTitle = onService
    ? `Unassign Firewall ${firewallLabel}?`
    : `Remove ${deviceDialog} ${device?.entity.label}?`;

  const confirmationText = (
    <Typography>
      Are you sure you want to{' '}
      {onService
        ? `unassign Firewall ${firewallLabel} from ${deviceDialog} ${device?.entity.label}?`
        : `remove ${deviceDialog} ${device?.entity.label} from Firewall ${firewallLabel}?`}
    </Typography>
  );

  const primaryButtonText = onService ? 'Unassign Firewall' : 'Remove';

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: primaryButtonText,
            loading: isPending,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
          style={{ padding: 0 }}
        />
      }
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={dialogTitle}
    >
      {confirmationText}
    </ConfirmationDialog>
  );
});
