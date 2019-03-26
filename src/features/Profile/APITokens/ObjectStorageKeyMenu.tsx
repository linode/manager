import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  // prop-drilled from parent
  objectStorageKey: Linode.ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: Linode.ObjectStorageKey) => void;
}

type CombinedProps = Props;

const ObjectStorageKeyMenu: React.StatelessComponent<CombinedProps> = props => {
  const createActions = () => {
    const { openRevokeDialog, objectStorageKey } = props;

    return (closeMenu: Function): Action[] => {
      return [
        // @todo: "Rename" action will go here
        {
          title: 'Revoke',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            openRevokeDialog(objectStorageKey);
            closeMenu();
          }
        }
      ];
    };
  };
  return <ActionMenu createActions={createActions()} />;
};

export default ObjectStorageKeyMenu;
