import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRestore: () => void;
  onDeploy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ImagesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onRestore,
      onDeploy,
      onEdit,
      onDelete,
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Restore to Existing Linode',
          disabled: true,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Deploy New Linode',
          disabled: true,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete();
            closeMenu();
            e.preventDefault();
          },
        },
      ];

      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(ImagesActionMenu);
