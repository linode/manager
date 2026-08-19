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
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';
import { IAM_ROLES_PENDO_IDS } from '../constants';

import type { IAMAction } from '../../routes';
interface Props {
  hasAssignNewRoleDrawer: boolean;
  text: string;
}

const DEFAULTS_ROLES_URL = '/iam/roles/defaults/roles';
const USER_ROLES_URL = '/iam/users/$username/roles';

export const NoAssignedRoles = (props: Props) => {
  const { text, hasAssignNewRoleDrawer } = props;
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const navigate = useNavigate();
  const { action } = useSearch({ strict: false }) as { action?: IAMAction };

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const actionHandler = (action: IAMAction, username?: string) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        action,
        username,
      }),
    });
  };

  const handleAssignNewRoles = () => {
    actionHandler('assign-new-roles');
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
        username: undefined,
      }),
    });
  };

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="doc-no-selection" />
      <ZeroErrorTitle>This list is empty</ZeroErrorTitle>
      <ZeroErrorDescription>{text}</ZeroErrorDescription>
      {hasAssignNewRoleDrawer && (
        <ZeroErrorActions>
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
              onClick={handleAssignNewRoles}
              variant="primary"
            >
              {isDefaultDelegationRolesForChildAccount
                ? 'Add New Default Roles'
                : 'Assign New Roles'}
              {!permissionToCheck && <Icon icon="info-outline" size="m" />}
            </Button>
          </Tooltip>
        </ZeroErrorActions>
      )}
      {hasAssignNewRoleDrawer && (
        <AssignNewRoleDrawer
          onClose={() => clearDialogAction('assign-new-roles')}
          open={action === 'assign-new-roles'}
        />
      )}
    </ZeroErrorState>
  );
};
