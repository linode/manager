import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from '@linode/ui';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface BucketActionMenuProps {
  cluster: string;
  label: string;
  onDetails: () => void;
  onRemove: () => void;
}

export const BucketActionMenu = (props: BucketActionMenuProps) => {
  const actions: Action[] = [
    {
      onClick: () => {
        props.onDetails();
      },
      title: 'Details',
    },
    {
      onClick: () => {
        props.onRemove();
      },
      title: 'Delete',
    },
  ];

  return (
    <StyledRootContainer>
      <Hidden mdDown>
        <InlineMenuAction
          onClick={() => {
            props.onDetails();
          }}
          actionText="Details"
        />
        <InlineMenuAction
          onClick={() => {
            props.onRemove();
          }}
          actionText="Delete"
        />
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Bucket ${props.label}`}
        />
      </Hidden>
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 0,
}));
