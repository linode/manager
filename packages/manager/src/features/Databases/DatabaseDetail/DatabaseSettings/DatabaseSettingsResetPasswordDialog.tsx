import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseCredentialsMutation } from '@linode/queries';
import * as React from 'react';

import type { Engine } from '@linode/api-v4';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsResetPasswordDialog = (props: Props) => {
  const { databaseEngine, databaseID, onClose, open } = props;

  const {
    error,
    isPending,
    mutateAsync,
    reset: resetMutation,
  } = useDatabaseCredentialsMutation(databaseEngine, databaseID);

  const onResetRootPassword = async () => {
    await mutateAsync();
    onClose();
  };

  const handleOnClose = () => {
    onClose();
    resetMutation?.();
  };

  return (
    <Modal closeModal={handleOnClose} open={open}>
      <span slot="title">Reset root password?</span>
      <div slot="body">
        {error ? (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={error[0].reason}
            type="error"
          />
        ) : undefined}

        <p>
          After resetting your root password, you can view your new password on
          the database cluster summary page.
        </p>
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={handleOnClose} variant="link">
          Cancel
        </Button>
        <Button
          data-testid="confirm"
          onClick={onResetRootPassword}
          processing={isPending}
          variant="primary"
        >
          Reset Root Password
        </Button>
      </div>
    </Modal>
  );
};
