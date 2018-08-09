import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  linodeStatus: string;
  onRename: () => void;
  onResize: () => void;
  onImagize: () => void;
  onDelete: () => void;
}

type CombinedProps = Props;

class DiskActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    const { linodeStatus } = this.props;
    const actions = [
      {
        title: 'Rename',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onRename();
          closeMenu();
        },
      },
      {
        title: 'Resize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onResize();
          closeMenu();
        },
      },
      {
        title: 'Imagize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onImagize();
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
