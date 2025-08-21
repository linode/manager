import { styled } from '@mui/material/styles';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { PermissionType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onCancelClick: () => void;
  permissions?: Partial<Record<PermissionType, boolean>>;
}

export const TransfersPendingActionMenu = (props: Props) => {
  const { onCancelClick, permissions } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        onCancelClick();
      },
      title: 'Cancel',
      disabled: !permissions?.cancel_service_transfer,
    },
  ];

  return (
    <StyledDiv>
      {actions.map((action) => {
        return (
          <InlineMenuAction
            actionText={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
          />
        );
      })}
    </StyledDiv>
  );
};

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
});
