import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { Engine } from '@linode/api-v4/lib/databases';
import { useDatabaseCredentialsMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
        Reset Password
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsResetPasswordDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseEngine, databaseID } = props;

  const [error, setError] = React.useState<string | undefined>();

  const { mutateAsync, isLoading } = useDatabaseCredentialsMutation(
    databaseEngine,
    databaseID
  );

  const onResetRootPassword = async () => {
    try {
      await mutateAsync();
      onClose();
    } catch (_error) {
      const reason = getAPIErrorOrDefault(
        _error,
        'There was an error resetting the root password'
      )[0].reason;
      setError(reason);
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Reset Root Password"
      onClose={onClose}
      actions={renderActions(onClose, onResetRootPassword, isLoading)}
      error={error}
    >
      <Typography>
        After resetting your Root Password, you can view your new password on
        the Database Cluster Summary page.
      </Typography>
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsResetPasswordDialog;
