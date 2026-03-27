import { Stack } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import { useIsObjMultiClusterEnabled } from '../../hooks/useIsObjectStorageGen2Enabled';
import { useAccessKeyDrawers } from '../hooks/useAccessKeyDrawers';

import type { ObjectStorageKey } from '@linode/api-v4';
import type { Theme } from '@mui/material';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyActionMenu = (props: Props) => {
  const { label, objectStorageKey, openRevokeDialog } = props;

  const { openDrawer } = useAccessKeyDrawers();

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  const isSmallViewport = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('md')
  );

  const actions = [
    {
      onClick: () => {
        openDrawer('edit-access-key', objectStorageKey.id);
      },
      title: isObjMultiClusterEnabled ? 'Edit' : 'Edit Label',
    },
    {
      onClick: () => {
        openDrawer('access-key-permissions', objectStorageKey.id);
      },
      title: 'Permissions',
    },
    ...(isObjMultiClusterEnabled
      ? [
          {
            onClick: () => {
              openDrawer('access-key-hostnames', objectStorageKey.id);
            },
            title: 'View Regions/S3 Hostnames',
          },
        ]
      : []),
    {
      onClick: () => {
        openRevokeDialog(objectStorageKey);
      },
      title: 'Revoke',
    },
  ];

  if (isObjMultiClusterEnabled || isSmallViewport) {
    return (
      <ActionMenu
        actionsList={actions}
        ariaLabel={`Action menu for Object Storage Key ${label}`}
      />
    );
  }

  return (
    <Stack direction="row" justifyContent="flex-end">
      {actions.map((action) => (
        <InlineMenuAction
          actionText={action.title}
          key={action.title}
          onClick={action.onClick}
        />
      ))}
    </Stack>
  );
};
