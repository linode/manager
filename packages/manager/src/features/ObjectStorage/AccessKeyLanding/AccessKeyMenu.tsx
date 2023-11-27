import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import { OpenAccessDrawer } from './types';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyMenu = (props: Props) => {
  const { objectStorageKey, openDrawer, openRevokeDialog } = props;

  const actions = [
    {
      onClick: () => {
        openDrawer('editing', objectStorageKey);
      },
      title: 'Edit Label',
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
          ariaLabel={`Action menu for Object Storage Key ${props.label}`}
        />
      </Hidden>
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
