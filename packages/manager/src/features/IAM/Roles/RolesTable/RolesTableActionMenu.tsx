import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { IAM_ROLES_PENDO_IDS } from '../../Shared/constants';

interface Props {
  canUpdateUserGrants: boolean;
  onClick?: () => void;
}

export const RolesTableActionMenu = ({
  canUpdateUserGrants,
  onClick,
}: Props) => {
  const { isParentUserType, isChildUserType } = useDelegationRole();
  // This menu has evolved over time to where it isn't much of a menu at all, but rather a single action.
  return (
    <InlineMenuAction
      actionText={'Assign Role'}
      buttonHeight={40}
      data-pendo-id={
        isParentUserType
          ? IAM_ROLES_PENDO_IDS.assignRoleAsParent
          : isChildUserType
            ? IAM_ROLES_PENDO_IDS.assignRoleAsChild
            : IAM_ROLES_PENDO_IDS.assignRoleAsDelegate
      }
      disabled={!canUpdateUserGrants}
      onClick={onClick}
      sx={{
        whiteSpace: 'nowrap',
      }}
      tooltip={
        !canUpdateUserGrants
          ? 'You do not have permission to assign roles.'
          : undefined
      }
    />
  );
};
