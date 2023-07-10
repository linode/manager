import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSnapshot}
        loading={loading}
        data-qa-confirm
      >
        Take Snapshot
      </Button>
    </ActionsPanel>
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
