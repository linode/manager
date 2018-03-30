import * as React from 'react';

import Button from 'material-ui/Button';

import ActionMenu, { Action } from '../../../components/ActionMenu/ActionMenu';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  id: string;
  onDelete: () => void;
}

type CombinedProps = Props;

class OAuthClientActionMenu extends React.Component<CombinedProps> {
  state = {
    confirmDeleteOpen: false,
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

  createLinodeActions = () => {
    // const { id } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
          },
        },
        {
          title: 'Reset Secret',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
          },
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
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
      </React.Fragment>
    );
  }
}

export default OAuthClientActionMenu;
