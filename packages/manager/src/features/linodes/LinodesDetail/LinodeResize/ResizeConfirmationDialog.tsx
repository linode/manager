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

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onResize: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'resize-dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={loading}
        onClick={onResize}
        data-qa-confirm
        data-testid={'resize-dialog-confirm'}
      >
        Resize
      </Button>
    </ActionsPanel>
  );
};

export const ResizeDialog: React.FC<Props> = (props) => {
  const {
    isOpen,
    error,
    submitting,
    currentPlan,
    targetPlan,
    onClose,
    onResize,
  } = props;

  return (
    <ConfirmationDialog
      title="Confirm Linode Resize"
      open={isOpen}
      error={error}
      onClose={onClose}
      actions={renderActions(submitting, onClose, onResize)}
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
