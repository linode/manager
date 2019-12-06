import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  credentialID: number;
  label: string;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export class CredentialActionMenu extends React.Component<CombinedProps, {}> {
  createActions = () => {
    const { label, credentialID, openDialog, openForEdit } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: () => {
            openForEdit(credentialID);
            closeMenu();
          }
        },
        {
          title: 'Delete',
          onClick: () => {
            openDialog(credentialID, label);
            closeMenu();
          }
        }
      ];
      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for Credential ${this.props.label}`}
      />
    );
  }
}

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(CredentialActionMenu);
