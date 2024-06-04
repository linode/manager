import { FirewallDevice } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRemoveFirewallDeviceMutation } from 'src/queries/firewalls';
import { queryKey as firewallQueryKey } from 'src/queries/firewalls';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { queryKey as nodebalancersQueryKey } from 'src/queries/nodebalancers';

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

  const { error, isLoading, mutateAsync } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const queryClient = useQueryClient();

  const deviceDialog = deviceType === 'linode' ? 'Linode' : 'NodeBalancer';

  const onDelete = async () => {
    await mutateAsync();
    const toastMessage = onService
      ? `Firewall ${firewallLabel} successfully unassigned`
      : `${deviceDialog} ${device?.entity.label} successfully removed`;
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });

    if (error) {
      enqueueSnackbar(error[0].reason, { variant: 'error' });
    }

    const queryKey =
      deviceType === 'linode' ? linodesQueryKey : nodebalancersQueryKey;

    // Since the linode was removed as a device, invalidate the linode-specific firewall query
    queryClient.invalidateQueries([
      queryKey,
      deviceType,
      device?.entity.id,
      'firewalls',
    ]);

    queryClient.invalidateQueries([firewallQueryKey]);

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
            loading: isLoading,
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
