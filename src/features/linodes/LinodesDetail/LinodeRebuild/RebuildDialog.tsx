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

export const RebuildDialog: React.StatelessComponent<
  RebuildDialogProps
> = props => {
  const { isOpen, isLoading, handleClose, handleSubmit } = props;

  const actions = () => (
    <ActionsPanel>
      <Button type="cancel" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        type="secondary"
        destructive
        onClick={handleSubmit}
        loading={isLoading}
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
        <b>Delete all existing data</b> on this Linode and redeploy?
      </Typography>
    </ConfirmationDialog>
  );
};
