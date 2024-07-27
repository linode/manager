import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { OpenAccessDrawer } from '../types';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyActionMenu = ({
  label,
  objectStorageKey,
  openDrawer,
  openRevokeDialog,
}: Props) => {
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
    {
      onClick: () => {
        openRevokeDialog(objectStorageKey);
      },
      title: 'Revoke',
    },
  ];

  return (
    <StyledInlineActionsContainer>
      {isObjMultiClusterEnabled ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Object Storage Key ${label}`}
        />
      ) : (
        <>
          <Hidden mdDown>
            {actions.map((thisAction) => (
              <InlineMenuAction
                actionText={thisAction.title}
                key={thisAction.title}
                onClick={thisAction.onClick}
              />
            ))}
          </Hidden>
          <Hidden mdUp>
            <ActionMenu
              actionsList={actions}
              ariaLabel={`Action menu for Object Storage Key ${label}`}
            />
          </Hidden>
        </>
      )}
    </StyledInlineActionsContainer>
  );
};

const StyledInlineActionsContainer = styled('div', {
  label: 'StyledInlineActionsContainer',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
}));
