import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  groupName: string;
  openDrawer: (groupName: string) => void;
}

export type CombinedProps = Props;

export const GroupsActionMenu: React.FC<CombinedProps> = props => {
  const { groupName, openDrawer } = props;

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          openDrawer(groupName);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          alert('delete group');
        }
      }
    ];
    return actions;
  };

  return <ActionMenu createActions={createActions} />;
};

export default GroupsActionMenu;
