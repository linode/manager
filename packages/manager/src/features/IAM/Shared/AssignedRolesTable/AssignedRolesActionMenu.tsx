import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { DrawerModes, ExtendedRoleMap } from '../utilities';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  handleChangeRole: (role: ExtendedRoleMap, mode: DrawerModes) => void;
  handleUnassignRole: (role: ExtendedRoleMap) => void;
  handleUpdateEntities: (role: ExtendedRoleMap, mode: DrawerModes) => void;
  handleViewEntities: (role: string) => void;
  role: ExtendedRoleMap;
}

export const AssignedRolesActionMenu = ({
  handleChangeRole,
  handleUnassignRole,
  handleUpdateEntities,
  handleViewEntities,
  role,
}: Props) => {
  const accountMenu: Action[] = [
    {
      onClick: () => {
        handleChangeRole(role, 'change-role');
      },
      title: 'Change Role',
    },
    {
      onClick: () => {
        handleUnassignRole(role);
      },
      title: 'Unassign Role',
    },
  ];

  const entitiesMenu: Action[] = [
    {
      onClick: () => handleViewEntities(role.name),
      title: 'View Entities',
    },
    {
      onClick: () => {
        handleUpdateEntities(role, 'update-entities');
      },
      title: 'Update List of Entities',
    },
    {
      onClick: () => {
        handleChangeRole(role, 'change-role');
      },
      title: 'Change Role',
    },
    {
      onClick: () => {
        handleUnassignRole(role);
      },
      title: 'Unassign Role',
    },
  ];

  const actions = role.access === 'account_access' ? accountMenu : entitiesMenu;

  return <ActionMenu actionsList={actions} ariaLabel="action menu" />;
};
