import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  onClose: () => void;
};

const stubFunc = () => { };

// I feel like this pattern should be its own component due to how common it is
const renderActions = (onClose: () => void) => {
  return (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={stubFunc}
        data-qa-confirm
        data-testid="dialog-confrim"
      >
        Delete Cluster
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose } = props;
  return (
    <ConfirmationDialog
      open={open}
      title="Delete Database Cluster"
      onClose={onClose}
      actions={renderActions(onClose)}
    >
      <Notice
        warning
        text="Deleting a database cluster is permenant and cannot be undone." />
      <Typography>
        Are you sure you want to continue?
      </Typography>
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsDeleteClusterDialog;
