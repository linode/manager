import {
  linodeQueries,
  nodebalancerQueries,
  useRemoveFirewallDeviceMutation,
} from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { formattedTypes } from './constants';

import type { APIError, FirewallDevice } from '@linode/api-v4';

export interface Props {
  device: FirewallDevice | undefined;
  firewallError?: APIError[] | null;
  firewallId: number;
  firewallLabel: string;
  isFetching?: boolean;
  onClose: () => void;
  onService: boolean | undefined;
  open: boolean;
}

export const RemoveDeviceDialog = React.memo((props: Props) => {
  const {
    device,
    firewallError,
    firewallId,
    firewallLabel,
    isFetching,
    onClose,
    onService,
    open,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const deviceType = device?.entity.type;

  const entityLabelToUse =
    deviceType === 'linode_interface'
      ? `(ID: ${device?.entity.id})`
      : device?.entity.label;

  const { error, isPending, mutateAsync } = useRemoveFirewallDeviceMutation();

  const queryClient = useQueryClient();

  const deviceDialog = formattedTypes[deviceType ?? 'linode'];

  const onDelete = async () => {
    if (!device) {
      return;
    }

    await mutateAsync({ firewallId, deviceId: device.id });

    const toastMessage = onService
      ? `Firewall ${firewallLabel} successfully unassigned`
      : `${deviceDialog} ${entityLabelToUse} successfully removed`;

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
    : `Remove ${deviceDialog} ${entityLabelToUse}?`;

  const confirmationText = (
    <Typography>
      Are you sure you want to{' '}
      {onService
        ? `unassign Firewall ${firewallLabel} from ${deviceDialog} ${device?.entity.label}?`
        : `remove ${deviceDialog} ${entityLabelToUse} from Firewall ${firewallLabel}?`}
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
      error={error?.[0]?.reason || firewallError?.[0]?.reason}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={dialogTitle}
    >
      {confirmationText}
    </ConfirmationDialog>
  );
});
