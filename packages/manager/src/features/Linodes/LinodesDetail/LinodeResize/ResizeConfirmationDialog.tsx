import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
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
    <ActionsPanel
      primaryButtonDataTestId="confirm"
      primaryButtonHandler={onResize}
      primaryButtonLoading={loading}
      primaryButtonText="Resize"
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
      showPrimary
      showSecondary
      style={{ padding: 0 }}
    />
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
