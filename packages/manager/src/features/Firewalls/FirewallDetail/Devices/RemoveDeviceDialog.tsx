import { FirewallDevice } from '@linode/api-v4';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRemoveFirewallDeviceMutation } from 'src/queries/firewalls';

export interface Props {
  device: FirewallDevice | undefined;
  firewallId: number;
  firewallLabel: string;
  onClose: () => void;
  open: boolean;
}

export const RemoveDeviceDialog = (props: Props) => {
  const { device, firewallId, firewallLabel, onClose, open } = props;

  const { error, isLoading, mutateAsync } = useRemoveFirewallDeviceMutation(
    firewallId,
    device?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            data-qa-cancel
            data-testid={'dialog-cancel'}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-qa-confirm
            data-testid={'dialog-confirm'}
            loading={isLoading}
            onClick={onDelete}
          >
            Remove
          </Button>
        </ActionsPanel>
      }
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={`Remove ${device?.entity.label} from ${firewallLabel}?`}
    >
      <Typography>
        Are you sure you want to remove {device?.entity.label} from{' '}
        {firewallLabel}?
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(RemoveDeviceDialog);
