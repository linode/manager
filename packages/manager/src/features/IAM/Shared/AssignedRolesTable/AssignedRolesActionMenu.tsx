import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { ExtendedRoleMap } from '../utilities';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  handleChangeRole: (role: ExtendedRoleMap) => void;
  handleUnassignRole: (role: ExtendedRoleMap) => void;
  handleViewEntities: (role: string) => void;
  role: ExtendedRoleMap;
}

export const AssignedRolesActionMenu = ({
  handleChangeRole,
  handleUnassignRole,
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
        // mock
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
