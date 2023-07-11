import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

interface Props {
  open: boolean;
  error?: string;
  loading: boolean;
  onClose: () => void;
  onSnapshot: () => void;
}

export const CaptureSnapshotConfirmationDialog = (props: Props) => {
  const { open, loading, onClose, error, onSnapshot } = props;

  const actions = (
    <ActionsPanel
      style={{ padding: 0 }}
      showPrimary
      primaryButtonHandler={onSnapshot}
      primaryButtonLoading={loading}
      primaryButtonDataTestId="confirm"
      primaryButtonText="Take Snapshot"
      showSecondary
      secondaryButtonHandler={onClose}
      secondaryButtonDataTestId="cancel"
      secondaryButtonText="Cancel"
    />
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Take a snapshot?"
      onClose={onClose}
      actions={actions}
      error={error}
    >
      <Typography>
        Taking a snapshot will back up your Linode in its current state,
        overriding your previous snapshot. Are you sure?
      </Typography>
    </ConfirmationDialog>
  );
};
