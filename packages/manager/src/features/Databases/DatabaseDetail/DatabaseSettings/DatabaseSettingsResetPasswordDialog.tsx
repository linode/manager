import { Engine } from '@linode/api-v4/lib/databases';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useDatabaseCredentialsMutation } from 'src/queries/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  onClose: () => void;
  open: boolean;
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
        data-qa-cancel
        data-testid={'dialog-cancel'}
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-qa-confirm
        data-testid="dialog-confrim"
        loading={loading}
        onClick={onConfirm}
      >
        Reset Root Password
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsResetPasswordDialog: React.FC<Props> = (props) => {
  const { databaseEngine, databaseID, onClose, open } = props;

  const { error, isLoading, mutateAsync } = useDatabaseCredentialsMutation(
    databaseEngine,
    databaseID
  );

  const onResetRootPassword = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={renderActions(onClose, onResetRootPassword, isLoading)}
      onClose={onClose}
      open={open}
      title="Reset Root Password"
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
