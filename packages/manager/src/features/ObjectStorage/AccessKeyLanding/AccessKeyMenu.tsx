import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { OpenAccessDrawer } from './types';

interface Props {
  // prop-drilled from parent
  objectStorageKey: ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: ObjectStorageKey) => void;
  openDrawer: OpenAccessDrawer;

  label: string;
}

type CombinedProps = Props;

const AccessKeyMenu: React.FC<CombinedProps> = props => {
  const createActions = () => {
    const { openRevokeDialog, objectStorageKey, openDrawer } = props;

    return (closeMenu: Function): Action[] => {
      return [
        {
          title: 'Rename Access Key',
          onClick: () => {
            openDrawer('editing', objectStorageKey);
            closeMenu();
          }
        },
        {
          title: 'View Permissions',
          onClick: () => {
            openDrawer('viewing', objectStorageKey);
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
