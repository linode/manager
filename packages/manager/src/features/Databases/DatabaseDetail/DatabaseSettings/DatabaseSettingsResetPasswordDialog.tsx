import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { Engine, resetDatabaseCredentials } from '@linode/api-v4/lib/databases';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
}

// I feel like this pattern should be its own component due to how common it is
const renderActions = (onClose: () => void, onConfirm: () => void) => {
  return (
    <ActionsPanel>
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
        onClick={onConfirm}
        data-qa-confirm
        data-testid="dialog-confrim"
      >
        Reset Password
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsResetPasswordDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseEngine, databaseID } = props;

  const onResetRootPassword = async () => {
    await resetDatabaseCredentials(databaseEngine, databaseID);
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Reset Root Password"
      onClose={onClose}
      actions={renderActions(onClose, onResetRootPassword)}
    >
      <Notice
        warning
        text="Deleting a database cluster is permenant and cannot be undone."
      />
      <Typography>Are you sure you want to continue?</Typography>
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsResetPasswordDialog;
