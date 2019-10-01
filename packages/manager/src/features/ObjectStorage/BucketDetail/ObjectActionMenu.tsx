import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Props {
  handleClickDownload: (newTab: boolean) => void;
  handleClickDelete: () => void;
}

export const ObjectActionMenu: React.FC<Props> = props => {
  const createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Download',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          const shouldOpenInNewTab = e.metaKey || e.ctrlKey;
          props.handleClickDownload(shouldOpenInNewTab);
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          props.handleClickDelete();
          closeMenu();
          e.preventDefault();
        }
      }
    ];
  };

  return <ActionMenu createActions={createActions()} />;
};

export default ObjectActionMenu;
