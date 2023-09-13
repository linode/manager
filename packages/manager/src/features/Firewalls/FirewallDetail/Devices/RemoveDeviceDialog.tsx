import { FirewallDevice } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRemoveFirewallDeviceMutation } from 'src/queries/firewalls';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';

export interface Props {
  device: FirewallDevice | undefined;
  firewallId: number;
  firewallLabel: string;
  linodeId?: number;
  onClose: () => void;
  onLinodeNetworkTab?: boolean;
  open: boolean;
}

export const RemoveDeviceDialog = React.memo((props: Props) => {
  const {
    device,
    firewallId,
    firewallLabel,
    linodeId,
    onClose,
    onLinodeNetworkTab,
    open,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const queryClient = useQueryClient();

  const onDelete = async () => {
    await mutateAsync();

    if (error) {
      enqueueSnackbar(error[0].reason, { variant: 'error' });
    } else {
      enqueueSnackbar(`${device?.entity.label} removed successfully.`, {
        variant: 'success',
      });
    }

    // Since the linode was removed as a device, invalidate the linode-specific firewall query
    queryClient.invalidateQueries([
      linodesQueryKey,
      'linode',
      linodeId,
      'firewalls',
    ]);

    onClose();
  };

  const dialogTitle = onLinodeNetworkTab
    ? `Unassign Firewall ${firewallLabel}?`
    : `Remove ${device?.entity.label} from ${firewallLabel}?`;

  const confirmationText = (
    <Typography>
      Are you sure you want to{' '}
      {onLinodeNetworkTab
        ? 'unassign this Firewall?'
        : `remove ${device?.entity.label} from ${firewallLabel}?`}
    </Typography>
  );

  const primaryButtonText = onLinodeNetworkTab ? 'Unassign Firewall' : 'Remove';

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
