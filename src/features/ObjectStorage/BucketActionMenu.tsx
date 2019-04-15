import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRemove: (cluster: string, bucketLabel: string) => void;
  bucketLabel: string;
  cluster: string;
}

export const BucketActionMenu: React.StatelessComponent<Props> = props => {
  const handleRemove = () => {
    const { bucketLabel, cluster, onRemove } = props;
    onRemove(cluster, bucketLabel);
  };

  const createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Remove',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          handleRemove();
          closeMenu();
          e.preventDefault();
        }
      }
    ];
  };

  return <ActionMenu createActions={createActions()} />;
};

export default BucketActionMenu;
