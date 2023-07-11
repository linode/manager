import { FirewallDevice } from '@linode/api-v4';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRemoveFirewallDeviceMutation } from 'src/queries/firewalls';

export interface Props {
  open: boolean;
  onClose: () => void;
  device: FirewallDevice | undefined;
  firewallLabel: string;
  firewallId: number;
}

export const RemoveDeviceDialog = (props: Props) => {
  const { device, firewallLabel, firewallId, onClose, open } = props;

  const { mutateAsync, isLoading, error } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      title={`Remove ${device?.entity.label} from ${firewallLabel}?`}
      open={open}
      onClose={onClose}
      error={error?.[0]?.reason}
      actions={
        <ActionsPanel
          style={{ padding: 0 }}
          showPrimary
          primaryButtonDataTestId="confirm"
          primaryButtonHandler={onDelete}
          primaryButtonLoading={isLoading}
          primaryButtonText="Remove"
          showSecondary
          secondaryButtonDataTestId="cancel"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Are you sure you want to remove {device?.entity.label} from{' '}
        {firewallLabel}?
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(RemoveDeviceDialog);
