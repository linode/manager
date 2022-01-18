import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { deleteDatabase, Engine } from '@linode/api-v4/lib/databases';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
};

// I feel like this pattern should be its own component due to how common it is
const renderActions = (onClose: () => void, onConfirm: () => Promise<void>) => {
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
        onClick={onConfirm}
        data-qa-confirm
        data-testid="dialog-confrim"
      >
        Delete Cluster
      </Button>
    </ActionsPanel>
  );
};

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseID, databaseEngine } = props;

  const onDeleteCluster = async () => {
    await deleteDatabase(databaseEngine, databaseID);
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Delete Database Cluster"
      onClose={onClose}
      actions={renderActions(onClose, onDeleteCluster)}
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
