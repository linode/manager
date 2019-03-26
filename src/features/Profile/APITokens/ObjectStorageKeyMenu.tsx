import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  objectStorageKey: Linode.ObjectStorageKey;
  // openEditDrawer: : Linode.Token) => void;
  openRevokeDialog: (key: Linode.ObjectStorageKey) => void;
}

type CombinedProps = Props;

const ObjectStorageKeyMenu: React.StatelessComponent<CombinedProps> = props => {
  const createActions = () => {
    const { openRevokeDialog, objectStorageKey } = props;

    return (closeMenu: Function): Action[] => {
      return [
        // {
        //   title: 'Rename Key',
        //   onClick: (e: React.MouseEvent<HTMLElement>) => {
        //     openEditDrawer(token);
        //     closeMenu();
        //   }
        // },
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
