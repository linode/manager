import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { ExtendedRoleView } from '../types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  handleChangeRole: (role: ExtendedRoleView) => void;
  handleUnassignRole: (role: ExtendedRoleView) => void;
  handleUpdateEntities: (role: ExtendedRoleView) => void;
  handleViewEntities: (role: string) => void;
  role: ExtendedRoleView;
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
        handleChangeRole(role);
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
        handleUpdateEntities(role);
      },
      title: 'Update List of Entities',
    },
    {
      onClick: () => {
        handleChangeRole(role);
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
