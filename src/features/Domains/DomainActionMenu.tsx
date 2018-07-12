import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onEditRecords: () => void;
  onRemove: () => void;
  onClone: () => void;
}

type CombinedProps = Props;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Edit DNS Records',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.props.onEditRecords();
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Check Zone',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Zone File',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.props.onClone();
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Remove',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.props.onRemove();
          closeMenu();
          e.preventDefault();
        },
      },
    ];
  }

  render() {
    return (<ActionMenu createActions={this.createActions()} />);
  }
}

export default LinodeActionMenu;
