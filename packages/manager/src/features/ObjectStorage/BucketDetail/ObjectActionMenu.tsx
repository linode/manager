import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Props {
  objectName: string;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
}

export const ObjectActionMenu: React.FC<Props> = props => {
  const createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Download',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          const shouldOpenInNewTab = true;
          props.handleClickDownload(props.objectName, shouldOpenInNewTab);
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          props.handleClickDelete(props.objectName);
          closeMenu();
          e.preventDefault();
        }
      }
    ];
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Object ${props.objectName}`}
    />
  );
};

export default ObjectActionMenu;
