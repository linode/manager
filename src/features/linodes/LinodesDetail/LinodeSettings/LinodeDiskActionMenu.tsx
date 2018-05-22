import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  linodeStatus: string;
  onEdit: () => void;
  onDelete: () => void;
}

type CombinedProps = Props;

class DiskActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    const { linodeStatus } = this.props;
    const actions = [
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onEdit();
          closeMenu();
        },
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onDelete();
          closeMenu();
        },
        disabled: linodeStatus !== 'offline',
        tooltip: 'You can\'t delete this disk because we don\'t want you to.',
      },
    ];

    return actions;
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default DiskActionMenu;
