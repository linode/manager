import { ObjectStorageKey } from 'linode-js-sdk/lib/object-storage';
import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  // prop-drilled from parent
  objectStorageKey: ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: ObjectStorageKey) => void;
  openDrawerForEditing: (key: ObjectStorageKey) => void;
  label: string;
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
  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Object Storage Key ${props.label}`}
    />
  );
};

export default AccessKeyMenu;
