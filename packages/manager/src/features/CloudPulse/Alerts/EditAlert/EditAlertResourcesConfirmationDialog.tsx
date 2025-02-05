import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ActionPanelProps } from 'src/components/ActionsPanel/ActionsPanel';

interface AlertResourcesConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
}

export const EditAlertResourcesConfirmDialog = React.memo(
  (props: AlertResourcesConfirmDialogProps) => {
    const { onClose, onConfirm, open } = props;

    const actionProps: ActionPanelProps = {
      primaryButtonProps: {
        'data-testid': 'editconfirmation',
        label: 'Confirm',
        onClick: onConfirm,
      },
      secondaryButtonProps: {
        label: 'Cancel',
        onClick: onClose,
      },
    };

    return (
      <ConfirmationDialog
        actions={<ActionsPanel {...actionProps} />}
        onClose={onClose}
        open={open}
        sx={{ fontSize: '16px' }}
        title="Confirm alert updates"
      >
        You have changed the resource settings for your alert.
        <br /> This also updates your alert definition.
      </ConfirmationDialog>
    );
  }
);
