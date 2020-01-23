import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Props {
  onRemove: () => void;
  label: string;
}

export const BucketActionMenu: React.StatelessComponent<Props> = props => {
  const createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          props.onRemove();
          closeMenu();
          e.preventDefault();
        }
      }
    ];
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Bucket ${props.label}`}
    />
  );
};

export default BucketActionMenu;
