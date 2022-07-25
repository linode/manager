import { Engine } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { useDatabaseCredentialsMutation } from 'src/queries/databases';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
}

export const DatabaseSettingsResetPasswordDialog = (props: Props) => {
  const { open, onClose, databaseEngine, databaseID } = props;

  const { mutateAsync, isLoading, error } = useDatabaseCredentialsMutation(
    databaseEngine,
    databaseID
  );

  const onResetRootPassword = async () => {
    await mutateAsync();
    onClose();
  };

  const actions = (
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
        onClick={onResetRootPassword}
        data-qa-confirm
        data-testid="dialog-confrim"
        loading={isLoading}
      >
        Reset Root Password
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Reset Root Password"
      onClose={onClose}
      actions={actions}
      error={error?.[0]?.reason}
    >
      <Typography>
        After resetting your root password, you can view your new password on
        the database cluster summary page.
      </Typography>
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsResetPasswordDialog;
