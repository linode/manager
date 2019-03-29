import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface RevokeKeysDialogProps {
  label: string;
  isOpen: boolean;
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  errors?: Linode.ApiFieldError[];
}

export const RevokeKeysDialog: React.StatelessComponent<
  RevokeKeysDialogProps
> = props => {
  const { label, isOpen, isLoading, handleClose, handleSubmit, errors } = props;

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
        Revoke
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={handleClose}
      title={`Revoking ${label}`}
      actions={actions}
      error={(errors || []).map(e => e.reason).join(',')}
    >
      <Typography>
        Are you sure you want to revoke this Object Storage key?
      </Typography>
    </ConfirmationDialog>
  );
};
export default RevokeKeysDialog;
