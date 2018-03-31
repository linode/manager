import * as React from 'react';

import Button from 'material-ui/Button';

import ActionMenu, { Action } from '../../../components/ActionMenu/ActionMenu';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Drawer from 'src/components/Drawer';

interface Props {
  id: string;
  onDelete: () => void;
  onReset: () => void;
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
        <Button onClick={() => this.toggleConfirmDelete(false)}>No</Button>
        <Button
          variant="raised"
          color="secondary"
          className="destructive"
          onClick={() => {
            this.toggleConfirmDelete(false);
            this.props.onDelete();
          }}>
          Yes
        </Button>
      </React.Fragment>
    );
  }

  toggleConfirmReset = (v: Boolean) => this.setState({ confirmResetOpen: v });

  resetDialogActions = () => {
    return (
      <React.Fragment>
        <Button onClick={() => this.toggleConfirmReset(false)}>No</Button>
        <Button
          variant="raised"
          color="secondary"
          className="destructive"
          onClick={() => {
            this.toggleConfirmReset(false);
            this.props.onReset();
          }}>
          Yes
        </Button>
      </React.Fragment>
    );
  }




  createLinodeActions = () => {

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            // this.toggleEditDrawer(true);
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
        Are you sure you want to permanently reset the secret of this OAuth client?
        </ConfirmationDialog>
        <Drawer title="Do something."><h1>We're doin it!</h1></Drawer>
      </React.Fragment>
    );
  }
}

export default OAuthClientActionMenu;
