import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface EditPayload {
  label: string;
  redirect_uri: string;
  isPublic: boolean;
}
interface Props {
  id: string;
  editPayload: EditPayload;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  onEdit: (
    id: string,
    label: string,
    redirect_uri: string,
    isPublic: boolean
  ) => void;
}

type CombinedProps = Props;

class OAuthClientActionMenu extends React.Component<CombinedProps> {
  state = {
    confirmDeleteOpen: false,
    confirmResetOpen: false,
    createDrawerOpen: false
  };

  handleDelete = () => {
    const { id, onDelete } = this.props;
    onDelete(id);
  };

  handleResetSecret = () => {
    const { id, onReset } = this.props;
    onReset(id);
  };

  handleEdit = () => {
    const {
      editPayload: { label, redirect_uri, isPublic },
      id,
      onEdit
    } = this.props;
    onEdit(id, label, redirect_uri, isPublic);
  };

  toggleConfirmDelete = (v: Boolean) => this.setState({ confirmDeleteOpen: v });
  openConfirmDelete = () => this.toggleConfirmDelete(true);
  closeConfirmDelete = () => this.toggleConfirmDelete(false);

  onDeleteConfirm = () => {
    this.toggleConfirmDelete(false);
    this.handleDelete();
  };

  deleteDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            onClick={this.closeConfirmDelete}
            type="cancel"
            data-qa-button-cancel
          >
            Cancel
          </Button>
          <Button
            destructive
            type="secondary"
            onClick={this.onDeleteConfirm}
            data-qa-button-confirm
          >
            Delete
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };

  toggleConfirmReset = (v: Boolean) => this.setState({ confirmResetOpen: v });
  openConfirmReset = () => this.toggleConfirmReset(true);
  closeConfirmReset = () => this.toggleConfirmReset(false);

  onResetConfirm = () => {
    this.toggleConfirmReset(false);
    this.handleResetSecret();
  };

  resetDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            onClick={this.closeConfirmReset}
            type="cancel"
            data-qa-button-cancel
          >
            Cancel
          </Button>
          <Button
            destructive
            type="secondary"
            onClick={this.onResetConfirm}
            data-qa-button-confirm
          >
            Reset Secret
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };

  createLinodeActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleEdit();
            closeMenu();
          }
        },
        {
          title: 'Reset Secret',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.toggleConfirmReset(true);
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.toggleConfirmDelete(true);
          }
        }
      ];

      return actions;
    };
  };

  render() {
    return (
      <React.Fragment>
        <ActionMenu createActions={this.createLinodeActions()} />
        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDeleteOpen}
          actions={this.deleteDialogActions}
          onClose={this.closeConfirmDelete}
        >
          <Typography>
            Are you sure you want to permanently delete this app?
          </Typography>
        </ConfirmationDialog>
        <ConfirmationDialog
          title="Confirm Reset"
          open={this.state.confirmResetOpen}
          actions={this.resetDialogActions}
          onClose={this.closeConfirmReset}
        >
          <Typography>
            Are you sure you want to permanently reset the secret for this app?
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

export default OAuthClientActionMenu;
