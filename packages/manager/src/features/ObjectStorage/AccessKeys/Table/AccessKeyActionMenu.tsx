import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { useAccessKeyDrawers } from '../hooks/useAccessKeyDrawers';

import type { ObjectStorageKey } from '@linode/api-v4';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyActionMenu = (props: Props) => {
  const { label, objectStorageKey, openRevokeDialog } = props;

  const { openDrawer } = useAccessKeyDrawers();

  const actions = [
    {
      onClick: () => {
        openDrawer('edit-access-key', objectStorageKey.id);
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        openDrawer('access-key-permissions', objectStorageKey.id);
      },
      title: 'Permissions',
    },
    {
      onClick: () => {
        openDrawer('access-key-hostnames', objectStorageKey.id);
      },
      title: 'View Regions/S3 Hostnames',
    },
    {
      onClick: () => {
        openRevokeDialog(objectStorageKey);
      },
      title: 'Revoke',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Object Storage Key ${label}`}
    />
  );
};
