import { Typography } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  error: string | undefined;
  loading: boolean;
  onClose: () => void;
  onSnapshot: () => void;
  open: boolean;
}

export const CaptureSnapshotConfirmationDialog = (props: Props) => {
  const { error, loading, onClose, onSnapshot, open } = props;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Take Snapshot',
        loading,
        onClick: onSnapshot,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Take a snapshot?"
    >
      <Typography>
        Taking a snapshot will back up your Linode in its current state,
        overriding your previous snapshot. Are you sure?
      </Typography>
    </ConfirmationDialog>
  );
};
