import { Typography } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

export interface Props {
  currentPlan: string;
  error?: string;
  isOpen: boolean;
  onClose: () => void;
  onResize: () => void;
  submitting: boolean;
  targetPlan: string;
}

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onResize: () => void
) => {
  return (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: 'Resize',
        loading,
        onClick: onResize,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
  );
};

export const ResizeDialog = (props: Props) => {
  const {
    currentPlan,
    error,
    isOpen,
    onClose,
    onResize,
    submitting,
    targetPlan,
  } = props;

  return (
    <ConfirmationDialog
      actions={renderActions(submitting, onClose, onResize)}
      error={error}
      onClose={onClose}
      open={isOpen}
      title="Confirm Linode Resize"
    >
      <Typography>
        Are you sure you want to resize your Linode from {currentPlan} to{' '}
        {targetPlan}? Your Linode will be automatically shut down and migrated.
        You will be billed at the hourly rate of your new Linode plan.
      </Typography>
    </ConfirmationDialog>
  );
};
