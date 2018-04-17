import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  volumeId: number;
  onDetach: () => void;
  onDelete: () => void;
  onClone: () => void;
  onEdit: () => void;
  onResize: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const {
      onDetach,
      onDelete,
      onClone,
      onEdit,
      onResize,
    } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onResize();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onClone();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Detach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDetach();
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
      <ActionMenu createActions={this.createLinodeActions()} />
    );
  }
}

export default withRouter(LinodeActionMenu);
