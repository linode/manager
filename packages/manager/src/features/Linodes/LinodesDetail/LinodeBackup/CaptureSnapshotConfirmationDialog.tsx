import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

interface Props {
  error?: string;
  loading: boolean;
  onClose: () => void;
  onSnapshot: () => void;
  open: boolean;
}

export const CaptureSnapshotConfirmationDialog = (props: Props) => {
  const { error, loading, onClose, onSnapshot, open } = props;

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" data-qa-cancel onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-qa-confirm
        loading={loading}
        onClick={onSnapshot}
      >
        Take Snapshot
      </Button>
    </ActionsPanel>
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
