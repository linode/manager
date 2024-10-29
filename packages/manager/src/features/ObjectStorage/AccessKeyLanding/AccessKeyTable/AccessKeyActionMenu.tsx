import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Stack } from 'src/components/Stack';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

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

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
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

  if (isObjMultiClusterEnabled) {
    return (
      <ActionMenu
        actionsList={actions}
        ariaLabel={`Action menu for Object Storage Key ${label}`}
      />
    );
  }

  return (
    <>
      <Hidden mdDown>
        <Stack direction="row" justifyContent="flex-end">
          {actions.map((thisAction) => (
            <InlineMenuAction
              actionText={thisAction.title}
              key={thisAction.title}
              onClick={thisAction.onClick}
            />
          ))}
        </Stack>
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Object Storage Key ${label}`}
        />
      </Hidden>
    </>
  );
};
