import * as React from 'react';
import ActionMenu from 'src/components/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import InlineAction from 'src/components/InlineMenuAction';
import { OpenAccessDrawer } from './types';
import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';

interface Props {
  label: string;
  objectStorageKey: ObjectStorageKey;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (key: ObjectStorageKey) => void;
}

export const AccessKeyMenu = (props: Props) => {
  const { openRevokeDialog, objectStorageKey, openDrawer } = props;

  const actions = [
    {
      title: 'Edit Label',
      onClick: () => {
        openDrawer('editing', objectStorageKey);
      },
    },
    {
      title: 'Permissions',
      onClick: () => {
        openDrawer('viewing', objectStorageKey);
      },
    },
    {
      title: 'Revoke',
      onClick: () => {
        openRevokeDialog(objectStorageKey);
      },
    },
  ];

  return (
    <StyledInlineActionsContainer>
      <Hidden mdDown>
        {actions.map((thisAction) => (
          <InlineAction
            key={thisAction.title}
            actionText={thisAction.title}
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));
