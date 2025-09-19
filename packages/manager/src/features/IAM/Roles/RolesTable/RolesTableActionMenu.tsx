import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  canUpdateUserGrants: boolean;
  onClick?: () => void;
}

export const RolesTableActionMenu = ({
  canUpdateUserGrants,
  onClick,
}: Props) => {
  // This menu has evolved over time to where it isn't much of a menu at all, but rather a single action.
  return (
    <InlineMenuAction
      actionText={'Assign Role'}
      buttonHeight={40}
      disabled={!canUpdateUserGrants}
      onClick={onClick}
      tooltip={
        !canUpdateUserGrants
          ? 'You do not have permission to assign roles.'
          : undefined
      }
    />
  );
};
