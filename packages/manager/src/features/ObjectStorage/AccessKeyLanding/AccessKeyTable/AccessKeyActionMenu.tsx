import { Stack } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import { useIsObjMultiClusterEnabled } from '../../hooks/useIsObjectStorageGen2Enabled';

import type { OpenAccessDrawer } from '../types';
import type { ObjectStorageKey } from '@linode/api-v4';
import type { Theme } from '@mui/material';

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

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  const isSmallViewport = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('md')
  );

  const actions = [
    {
      onClick: () => {
        openDrawer('editing', objectStorageKey);
      },
      title: isObjMultiClusterEnabled ? 'Edit' : 'Edit Label',
    },
    {
      onClick: () => {
        openDrawer('viewing', objectStorageKey);
      },
      title: 'Permissions',
    },
    ...(isObjMultiClusterEnabled
      ? [
          {
            onClick: openHostnamesDrawer,
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
