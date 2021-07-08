import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface RebuildDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

// During post-CMR cleanup, we should rename this component to something like "RebuildConfirmationDialog" or something similar, and rename LinodeRebuildDialog to "RebuildDialog"
export const RebuildDialog: React.FC<RebuildDialogProps> = (props) => {
  const { isOpen, isLoading, handleClose, handleSubmit } = props;

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleSubmit}
        loading={isLoading}
        data-qa-submit-rebuild
      >
        Rebuild
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={handleClose}
      title="Confirm Linode Rebuild"
      actions={actions}
    >
      <Typography>
        Are you sure you want to rebuild this Linode? This will result in
        permanent data loss.
      </Typography>
    </ConfirmationDialog>
  );
};
