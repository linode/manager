import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  poweredOff: boolean;
  onDetach: () => void;
  onDelete: () => void;
  onClone: () => void;
  onEdit: () => void;
  onResize: () => void;
}

type CombinedProps = Props;

export class LinodeVolumeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const {
      onDetach,
      onDelete,
      onClone,
      onEdit,
      onResize,
      poweredOff,
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Rename',
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
        }
      ];

      if (poweredOff) {
        actions.push(
          {
            title: 'Delete',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              onDelete();
              closeMenu();
              e.preventDefault();
            },
        })
      }
      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createLinodeActions()} />
    );
  }
}

export default LinodeVolumeActionMenu;
