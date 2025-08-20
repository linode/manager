import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { ExtendedRoleView } from '../types';
import type { PickPermissions } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type RolesActionsPermissions = PickPermissions<'is_account_admin'>;
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
  const accountMenu: Action[] = [
    {
      disabled: !permissions.is_account_admin,
      onClick: () => {
        handleChangeRole(role);
      },
      title: 'Change Role',
      tooltip: !permissions.is_account_admin
        ? 'You do not have permission to change this role.'
        : undefined,
    },
    {
      disabled: !permissions.is_account_admin,
      onClick: () => {
        handleUnassignRole(role);
      },
      title: 'Unassign Role',
      tooltip: !permissions.is_account_admin
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
      disabled: !permissions.is_account_admin,
      tooltip: !permissions.is_account_admin
        ? 'You do not have permission to update this role.'
        : undefined,
      onClick: () => {
        handleUpdateEntities(role);
      },
      title: 'Update List of Entities',
    },
    {
      disabled: !permissions.is_account_admin,
      tooltip: !permissions.is_account_admin
        ? 'You do not have permission to change this role.'
        : undefined,
      onClick: () => {
        handleChangeRole(role);
      },
      title: 'Change Role',
    },
    {
      disabled: !permissions.is_account_admin,
      tooltip: !permissions.is_account_admin
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
