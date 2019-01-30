import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  triggerDeleteStackScript: () => void;
  stackScriptLabel: string;
  error?: string;
  loading: boolean;
}

type CombinedProps = Props;

const DeleteDialog: React.StatelessComponent<CombinedProps> = props => {
  const {
    isOpen,
    handleClose,
    triggerDeleteStackScript,
    stackScriptLabel,
    error,
    loading
  } = props;

  const renderActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button type="cancel" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="secondary"
            destructive
            loading={loading}
            onClick={triggerDeleteStackScript}
          >
            Delete
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };
  return (
    <ConfirmationDialog
      title={`Delete ${stackScriptLabel}?`}
      open={isOpen}
      actions={renderActions}
      onClose={handleClose}
      error={error}
    >
      <Typography>Are you sure you want to delete this StackScript?</Typography>
    </ConfirmationDialog>
  );
};

export default DeleteDialog;
