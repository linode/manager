import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  username: string;
  open: boolean;
  onDelete: (username: string) => void;
  onCancel: () => void;
}

const deleteUser = (props: Props) => () => {
  props.onDelete(props.username);
}

const renderActionsPanel = (props: Props) => () => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        variant="raised"
        type="secondary"
        destructive
        onClick={deleteUser(props)}
        data-qa-confirm-delete
      >
        Delete
      </Button>
      <Button
        variant="raised"
        type="cancel"
        onClick={props.onCancel}
        data-qa-cancel-delete
      >
        Cancel
      </Button>
    </ActionsPanel>
  )
}

const userDeleteConfirmationDialog = (props: Props) => {
  return (
    <ConfirmationDialog
      title="Confirm Deletion"
      actions={renderActionsPanel(props)}
      open={props.open}
    >
      {`User ${props.username} will be permanently deleted. Are you sure?`}
    </ConfirmationDialog>
  )
}

export default userDeleteConfirmationDialog;