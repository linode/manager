import * as React from 'react';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { IAM_ROLES_PENDO_IDS } from '../../Shared/constants';
import { InlineMenuAction } from '../../Shared/InlineMenuAction/InlineMenuAction';

interface Props {
  canUpdateUserGrants: boolean;
  onClick?: () => void;
}

export const RolesTableActionMenu = ({
  canUpdateUserGrants,
  onClick,
}: Props) => {
  const { isParentUserType, isChildUserType } = useDelegationRole();

  const pendoChildId = isChildUserType
    ? IAM_ROLES_PENDO_IDS.assignRoleAsChild
    : IAM_ROLES_PENDO_IDS.assignRoleAsDelegate;
  const pendoID = isParentUserType
    ? IAM_ROLES_PENDO_IDS.assignRoleAsParent
    : pendoChildId;

  return (
    <InlineMenuAction
      isActionDisabled={!canUpdateUserGrants}
      label="Assign Role"
      onClick={onClick}
      pendoID={pendoID}
      tooltipText="You do not have permission to assign roles."
    />
  );
};
