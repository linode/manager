import { FirewallDevice } from '@linode/api-v4';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRemoveFirewallDeviceMutation } from 'src/queries/firewalls';

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
    onClose,
    onLinodeNetworkTab,
    open,
  } = props;

  const { error, isLoading, mutateAsync } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();

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
            'data-testid': 'confirm',
            label: primaryButtonText,
            loading: isLoading,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
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
