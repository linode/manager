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

type CombinedProps = Props;

class UserDeleteConfirmationDialog extends React.PureComponent<
  CombinedProps,
  {}
> {
  deleteUser = () => this.props.onDelete(this.props.username);

  render() {
    return (
      <ConfirmationDialog
        title="Confirm Deletion"
        onClose={this.props.onCancel}
        actions={this.renderActionsPanel}
        open={this.props.open}
      >
        {`User ${
          this.props.username
        } will be permanently deleted. Are you sure?`}
      </ConfirmationDialog>
    );
  }

  renderActionsPanel = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="cancel"
          onClick={this.props.onCancel}
          data-qa-cancel-delete
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={this.deleteUser}
          data-qa-confirm-delete
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };
}

export default UserDeleteConfirmationDialog;
