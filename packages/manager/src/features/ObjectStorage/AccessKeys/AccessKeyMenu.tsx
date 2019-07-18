import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  // prop-drilled from parent
  objectStorageKey: Linode.ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: Linode.ObjectStorageKey) => void;
  openDrawerForEditing: (key: Linode.ObjectStorageKey) => void;
}

type CombinedProps = Props;

const AccessKeyMenu: React.StatelessComponent<CombinedProps> = props => {
  const createActions = () => {
    const { openRevokeDialog, objectStorageKey, openDrawerForEditing } = props;

    return (closeMenu: Function): Action[] => {
      return [
        {
          title: 'Rename Access Key',
          onClick: () => {
            openDrawerForEditing(objectStorageKey);
            closeMenu();
          }
        },
        {
          title: 'Revoke',
          onClick: () => {
            openRevokeDialog(objectStorageKey);
            closeMenu();
          }
        }
      ];
    };
  };
  return <ActionMenu createActions={createActions()} />;
};

export default AccessKeyMenu;
