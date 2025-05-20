import { styled } from '@mui/material/styles';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onCancelClick: () => void;
}

export const TransfersPendingActionMenu = (props: Props) => {
  const { onCancelClick } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        onCancelClick();
      },
      title: 'Cancel',
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
