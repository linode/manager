import { ActionsPanel } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Destination } from '@linode/api-v4';

interface Props {
  destination: Destination | undefined;
  error: string | undefined;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
  open: boolean;
}

export const DeleteDestinationDialog = React.memo((props: Props) => {
  const { error, loading, onClose, onDelete, open, destination } = props;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete',
        loading,
        disabled: false,
        onClick: onDelete,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Delete Destination"
    >
      Are you sure you want to delete &#34;{destination?.label}&#34;
      destination?
    </ConfirmationDialog>
  );
});
