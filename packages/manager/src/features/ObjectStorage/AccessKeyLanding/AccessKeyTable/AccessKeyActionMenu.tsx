import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { OpenAccessDrawer } from '../types';
import type { ObjectStorageKey } from '@linode/api-v4';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openDrawer: OpenAccessDrawer;
  openHostnamesDrawer: () => void;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyActionMenu = (props: Props) => {
  const {
    label,
    objectStorageKey,
    openDrawer,
    openHostnamesDrawer,
    openRevokeDialog,
  } = props;

  const actions = [
    {
      onClick: () => {
        openDrawer('editing', objectStorageKey);
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        openDrawer('viewing', objectStorageKey);
      },
      title: 'Permissions',
    },
    {
      onClick: openHostnamesDrawer,
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
