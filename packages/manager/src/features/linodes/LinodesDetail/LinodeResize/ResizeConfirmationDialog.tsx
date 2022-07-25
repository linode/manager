import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

export interface Props {
  isOpen: boolean;
  error?: string | JSX.Element;
  submitting: boolean;
  currentPlan: string;
  targetPlan: string;
  onClose: () => void;
  onResize: () => void;
}

export const ResizeDialog = (props: Props) => {
  const {
    isOpen,
    error,
    submitting,
    currentPlan,
    targetPlan,
    onClose,
    onResize,
  } = props;

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid="resize-dialog-cancel"
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onResize}
        loading={submitting}
        data-qa-confirm
        data-testid="resize-dialog-confirm"
      >
        Resize
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Confirm Linode Resize"
      open={isOpen}
      error={error}
      onClose={onClose}
      actions={actions}
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
