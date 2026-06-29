import {
  Button,
  Icon,
  Tooltip,
  ZeroErrorActions,
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';
import { IAM_ROLES_PENDO_IDS } from '../constants';
interface Props {
  hasAssignNewRoleDrawer: boolean;
  text: string;
}

export const NoAssignedRoles = (props: Props) => {
  const { text, hasAssignNewRoleDrawer } = props;
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const [isAssignNewRoleDrawerOpen, setIsAssignNewRoleDrawerOpen] =
    React.useState<boolean>(false);

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="doc-no-selection" />
      <ZeroErrorTitle>This list is empty</ZeroErrorTitle>
      <ZeroErrorDescription>{text}</ZeroErrorDescription>
      <ZeroErrorActions>
        {hasAssignNewRoleDrawer && (
          <Tooltip
            disabled={permissionToCheck}
            tooltipPlacement="bottom"
            tooltipText="You do not have permission to assign roles."
          >
            <Button
              data-pendo-id={
                isDefaultDelegationRolesForChildAccount
                  ? IAM_ROLES_PENDO_IDS.addNewDefaultRoles
                  : undefined
              }
              disabled={!permissionToCheck}
              onClick={() => setIsAssignNewRoleDrawerOpen(true)}
              variant="primary"
            >
              {isDefaultDelegationRolesForChildAccount
                ? 'Add New Default Roles'
                : 'Assign New Roles'}
              {!permissionToCheck && <Icon icon="info-outline" size="m" />}
            </Button>
          </Tooltip>
        )}
      </ZeroErrorActions>
      {hasAssignNewRoleDrawer && (
        <AssignNewRoleDrawer
          onClose={() => setIsAssignNewRoleDrawerOpen(false)}
          open={isAssignNewRoleDrawerOpen}
        />
      )}
    </ZeroErrorState>
  );
};
