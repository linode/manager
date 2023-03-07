import { FirewallDevice } from '@linode/api-v4';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
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
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            onClick={onClose}
            data-qa-cancel
            data-testid={'dialog-cancel'}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={onDelete}
            loading={isLoading}
            data-qa-confirm
            data-testid={'dialog-confirm'}
          >
            Remove
          </Button>
        </ActionsPanel>
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
