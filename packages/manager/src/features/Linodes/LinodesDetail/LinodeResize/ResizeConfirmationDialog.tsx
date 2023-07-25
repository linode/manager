import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

export interface Props {
  currentPlan: string;
  error?: JSX.Element | string;
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
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        data-qa-cancel
        data-testid={'resize-dialog-cancel'}
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-qa-confirm
        data-testid={'resize-dialog-confirm'}
        loading={loading}
        onClick={onResize}
      >
        Resize
      </Button>
    </ActionsPanel>
  );
};

export const ResizeDialog: React.FC<Props> = (props) => {
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

export default ResizeDialog;
