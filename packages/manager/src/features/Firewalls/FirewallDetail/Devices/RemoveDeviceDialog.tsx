import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

export interface Props {
  open: boolean;
  error?: string;
  loading: boolean;
  deviceLabel: string;
  firewallLabel: string;
  onClose: () => void;
  onRemove: () => void;
}

export const RemoveDeviceDialog: React.FC<Props> = props => {
  const {
    deviceLabel,
    error,
    firewallLabel,
    loading,
    onClose,
    onRemove,
    open
  } = props;
  return (
    <ConfirmationDialog
      title={`Remove ${deviceLabel} from ${firewallLabel}?`}
      open={open}
      onClose={onClose}
      actions={renderActions(loading, onClose, onRemove)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Are you sure you want to remove {deviceLabel} from {firewallLabel}?
      </Typography>
    </ConfirmationDialog>
  );
};

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onDelete: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        loading={loading}
        onClick={onDelete}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Remove
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(RemoveDeviceDialog);
