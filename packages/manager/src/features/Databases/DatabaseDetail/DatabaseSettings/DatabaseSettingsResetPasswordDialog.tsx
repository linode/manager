import { Engine } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useDatabaseCredentialsMutation } from 'src/queries/databases';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
}

// I feel like this pattern should be its own component due to how common it is
const renderActions = (
  onClose: () => void,
  onConfirm: () => void,
  loading: boolean
) => {
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
        loading={loading}
      >
        Reset Root Password
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsResetPasswordDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseEngine, databaseID } = props;

  const { mutateAsync, isLoading, error } = useDatabaseCredentialsMutation(
    databaseEngine,
    databaseID
  );

  const onResetRootPassword = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Reset Root Password"
      onClose={onClose}
      actions={renderActions(onClose, onResetRootPassword, isLoading)}
    >
      {error ? <Notice error>{error[0].reason}</Notice> : undefined}
      <Typography>
        After resetting your root password, you can view your new password on
        the database cluster summary page.
      </Typography>
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsResetPasswordDialog;
