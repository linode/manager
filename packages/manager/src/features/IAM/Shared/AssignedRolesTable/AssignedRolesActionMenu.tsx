import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';

import type { ExtendedRoleView } from '../types';
import type { PickPermissions } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type RolesActionsPermissions = PickPermissions<
  'is_account_admin' | 'update_default_delegate_access'
>;
interface Props {
  handleChangeRole: (role: ExtendedRoleView) => void;
  handleUnassignRole: (role: ExtendedRoleView) => void;
  handleUpdateEntities: (role: ExtendedRoleView) => void;
  handleViewEntities: (role: string) => void;
  permissions: Record<RolesActionsPermissions, boolean>;
  role: ExtendedRoleView;
}

export const AssignedRolesActionMenu = ({
  permissions,
  handleChangeRole,
  handleUnassignRole,
  handleUpdateEntities,
  handleViewEntities,
  role,
}: Props) => {
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const accountMenu: Action[] = [
    {
      disabled: !permissionToCheck,
      onClick: () => {
        handleChangeRole(role);
      },
      title: 'Change Role',
      tooltip: !permissionToCheck
        ? 'You do not have permission to change this role.'
        : undefined,
    },
    {
      disabled: !permissionToCheck,
      onClick: () => {
        handleUnassignRole(role);
      },
      title: 'Unassign Role',
      tooltip: !permissionToCheck
        ? 'You do not have permission to unassign this role.'
        : undefined,
    },
  ];

  const entitiesMenu: Action[] = [
    {
      onClick: () => handleViewEntities(role.name),
      title: 'View Entities',
    },
    {
      disabled: !permissionToCheck,
      tooltip: !permissionToCheck
        ? 'You do not have permission to update this role.'
        : undefined,
      onClick: () => {
        handleUpdateEntities(role);
      },
      title: 'Update List of Entities',
    },
    {
      disabled: !permissionToCheck,
      tooltip: !permissionToCheck
        ? 'You do not have permission to change this role.'
        : undefined,
      onClick: () => {
        handleChangeRole(role);
      },
      title: 'Change Role',
    },
    {
      disabled: !permissionToCheck,
      tooltip: !permissionToCheck
        ? 'You do not have permission to unassign this role.'
        : undefined,
      onClick: () => {
        handleUnassignRole(role);
      },
      title: 'Unassign Role',
    },
  ];

  const actions = role.access === 'account_access' ? accountMenu : entitiesMenu;

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for role ${role.name}`}
    />
  );
};
