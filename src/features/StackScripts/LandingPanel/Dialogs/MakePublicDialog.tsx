import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  triggerMakePublic: () => void;
  stackScriptLabel: string;
  error?: string;
  loading: boolean;
}

type CombinedProps = Props;

const DeleteDialog: React.StatelessComponent<CombinedProps> = props => {
  const {
    isOpen,
    handleClose,
    triggerMakePublic,
    stackScriptLabel,
    error,
    loading
  } = props;

  const renderActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button buttonType="cancel" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            destructive
            loading={loading}
            onClick={triggerMakePublic}
          >
            Yes, make me a star!
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };
  return (
    <ConfirmationDialog
      title="Woah, just a word of caution..."
      open={isOpen}
      actions={renderActions}
      onClose={handleClose}
      error={error}
    >
      <Typography>
        Are you sure you want to make {stackScriptLabel} public? This action
        cannot be undone, nor will you be able to delete the StackScript once
        made available to the public.
      </Typography>
    </ConfirmationDialog>
  );
};

export default DeleteDialog;
