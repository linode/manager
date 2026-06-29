import { Icon, Menu, MenuItem, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { IAM_ROLES_PENDO_IDS } from '../constants';

import type { EntitiesRole } from '../types';
import type { PickPermissions } from '@linode/api-v4';

export type RolesActionsPermissions = PickPermissions<
  'is_account_admin' | 'update_default_delegate_access'
>;
interface Props {
  assignment: EntitiesRole;
  handleChangeRole: (role: EntitiesRole) => void;
  handleRemoveAssignment: (role: EntitiesRole) => void;
  permissions: Record<RolesActionsPermissions, boolean>;
}

interface Action {
  disabled?: boolean;
  hidden?: boolean;
  id?: string;
  onClick: () => void;
  pendoId?: string;
  title: string;
  tooltip?: string;
}

export const AssignedEntitiesActionMenu = ({
  permissions,
  handleChangeRole,
  handleRemoveAssignment,
  assignment,
}: Props) => {
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const actions: Action[] = [
    {
      disabled: !permissionToCheck,
      onClick: () => {
        handleChangeRole(assignment);
      },
      title: 'Change Role',
      tooltip: !permissionToCheck
        ? 'You do not have permission to change this role.'
        : undefined,
    },
    {
      disabled: !permissionToCheck,
      onClick: () => {
        handleRemoveAssignment(assignment);
      },
      title: isDefaultDelegationRolesForChildAccount
        ? 'Remove'
        : 'Remove Assignment',
      tooltip: !permissionToCheck
        ? 'You do not have permission to remove this assignment.'
        : undefined,
    },
  ];

  const visibleActions = actions.filter((action) => !action.hidden);

  if (!visibleActions || visibleActions.length === 0) {
    return null;
  }

  const pendoId = isDefaultDelegationRolesForChildAccount
    ? IAM_ROLES_PENDO_IDS.delegateUsersActionMenu
    : undefined;

  return (
    <Menu
      aria-label={`Action menu for entity ${assignment.entity_name}`}
      data-pendo-id={pendoId}
      data-testid="user-action-menu"
      icon="actions"
      position="bottom-right"
      style={{ paddingRight: Spacing.S12 }}
    >
      {visibleActions.map((action) => (
        <MenuItem
          data-testid={action.title}
          disabled={Boolean(action.disabled)}
          key={action.title}
          onSelect={action.onClick}
          style={{
            minWidth: '210px',
            paddingRight: Spacing.S4,
          }}
          value={action.title}
        >
          <span
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              minWidth: '210px',
            }}
          >
            {action.title}
            {action.disabled ? (
              <Tooltip
                disabled={!action.disabled}
                key={action.title}
                noArrow={true}
                style={{ textAlign: 'left', whiteSpace: 'normal' }}
                tooltipPlacement="left"
                tooltipText={action.tooltip}
              >
                <Icon icon="info-outline" size="m" />
              </Tooltip>
            ) : null}
          </span>
        </MenuItem>
      ))}
    </Menu>
  );
};
