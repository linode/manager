import * as React from 'react';

import Typography from '@material-ui/core/Typography';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  id: string;
  onDelete: () => void;
  onReset: () => void;
  onEdit: () => void;
}

type CombinedProps = Props;

class OAuthClientActionMenu extends React.Component<CombinedProps> {
  state = {
    confirmDeleteOpen: false,
    confirmResetOpen: false,
    createDrawerOpen: false,
  };

  toggleConfirmDelete = (v: Boolean) => this.setState({ confirmDeleteOpen: v });
  openConfirmDelete = () => this.toggleConfirmDelete(true);
  closeConfirmDelete = () => this.toggleConfirmDelete(false);

  onDeleteConfirm = () => {
    this.toggleConfirmDelete(false);
    this.props.onDelete();
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
            data-qa-button-confirm>
            Delete
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }

  toggleConfirmReset = (v: Boolean) => this.setState({ confirmResetOpen: v });
  openConfirmReset = () => this.toggleConfirmReset(true);
  closeConfirmReset = () => this.toggleConfirmReset(false);

  onResetConfirm = () => {
    this.toggleConfirmReset(false);
    this.props.onReset();
  }

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
            data-qa-button-confirm>
            Reset Secret
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }

  createLinodeActions = () => {

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.props.onEdit();
            closeMenu();
          },
        },
        {
          title: 'Reset Secret',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.toggleConfirmReset(true);
          },
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.toggleConfirmDelete(true);
          },
        },
      ];

      return actions;
    };
  }

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
            Are you sure you want to permanently delete this OAuth client?
          </Typography>
        </ConfirmationDialog>
        <ConfirmationDialog
          title="Confirm Reset"
          open={this.state.confirmResetOpen}
          actions={this.resetDialogActions}
          onClose={this.closeConfirmReset}
        >
          <Typography>
            Are you sure you want to permanently reset the secret of this OAuth client?
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

export default OAuthClientActionMenu;
