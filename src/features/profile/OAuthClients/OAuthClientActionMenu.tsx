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

  deleteDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            destructive
            type="secondary"
            onClick={() => {
              this.toggleConfirmDelete(false);
              this.props.onDelete();
            }}
            data-qa-button-confirm>
            Yes
          </Button>
          <Button
            onClick={() => this.toggleConfirmDelete(false)}
            type="cancel"
            data-qa-button-cancel
          >
            No
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }

  toggleConfirmReset = (v: Boolean) => this.setState({ confirmResetOpen: v });

  resetDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            destructive
            type="secondary"
            onClick={() => {
              this.toggleConfirmReset(false);
              this.props.onReset();
            }}
            data-qa-button-confirm>
            Yes
          </Button>
          <Button
            onClick={() => this.toggleConfirmReset(false)}
            type="cancel"
            data-qa-button-cancel
          >
            No
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
          onClose={() => this.toggleConfirmDelete(false)}
        >
        Are you sure you want to permanently delete this OAuth client?
        </ConfirmationDialog>
        <ConfirmationDialog
          title="Confirm Reset"
          open={this.state.confirmResetOpen}
          actions={this.resetDialogActions}
          onClose={() => this.toggleConfirmReset(false)}
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
