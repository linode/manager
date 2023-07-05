import { Engine } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
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
    <ActionsPanel
      primary
      primaryButtonDataTestId="confirm"
      primaryButtonHandler={onConfirm}
      primaryButtonLoading={loading}
      primaryButtonText="Reset Root Password"
      secondary
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
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
