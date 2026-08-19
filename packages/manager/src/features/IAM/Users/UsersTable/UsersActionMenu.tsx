import { Icon, Menu, MenuItem, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_DELEGATE_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';

import type { PickPermissions, UserType } from '@linode/api-v4';

type UserActionMenuPermissions = PickPermissions<
  'delete_user' | 'is_account_admin' | 'view_user'
>;
interface Props {
  onDelete: (username: string) => void;
  permissions: Record<UserActionMenuPermissions, boolean>;
  username: string;
  userType?: UserType;
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

export const UsersActionMenu = (props: Props) => {
  const { onDelete, permissions, username, userType } = props;

  const navigate = useNavigate();
  const {
    isChildUserType,
    isParentUserType,
    isDelegateUserType,
    profileUserName,
  } = useDelegationRole();

  const isAccountAdmin = permissions.is_account_admin;
  const canViewUser = permissions.view_user;
  const canDeleteUser = isAccountAdmin || permissions.delete_user;
  const isDelegateUser = userType === 'delegate';

  // For child/delegate profiles viewing a delegate user, hide details-oriented menu actions
  const shouldHideForChildDelegate =
    (isChildUserType || isDelegateUserType) && isDelegateUser;

  const actions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/details',
          params: { username },
        });
      },
      hidden: shouldHideForChildDelegate,
      disabled: !canViewUser,
      tooltip: !canViewUser
        ? 'You do not have permission to view user details.'
        : undefined,
      title: 'View User Details',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/roles',
          params: { username },
        });
      },
      disabled: !canViewUser,
      tooltip: !canViewUser
        ? 'You do not have permission to view assigned roles.'
        : undefined,
      title: 'View Assigned Roles',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/entities',
          params: { username },
        });
      },
      disabled: !canViewUser,
      tooltip: !canViewUser
        ? 'You do not have permission to view entity access.'
        : undefined,
      title: 'View Entity Access',
    },
    {
      disabled: false,
      hidden: !isParentUserType,
      onClick: () => {
        navigate({
          to: '/iam/users/$username/delegations',
          params: { username },
        });
      },
      title: 'View Account Delegations',
      tooltip: undefined,
    },
    {
      disabled: username === profileUserName || !canDeleteUser,
      onClick: () => {
        onDelete(username);
      },
      hidden: shouldHideForChildDelegate,
      title: 'Delete User',
      tooltip:
        username === profileUserName
          ? "You can't delete the currently active user."
          : !canDeleteUser
            ? 'You do not have permission to delete this user.'
            : undefined,
    },
  ];

  const visibleActions = actions.filter((action) => !action.hidden);

  if (!visibleActions || visibleActions.length === 0) {
    return null;
  }

  const pendoChildId =
    userType === 'child'
      ? IAM_CHILD_USERS_PENDO_IDS.childUsernameActionMenu
      : IAM_PARENT_USERS_PENDO_IDS.parentUsernameActionMenu;

  const pendoId =
    userType === 'delegate'
      ? IAM_DELEGATE_USERS_PENDO_IDS.delegateUsernameActionMenu
      : pendoChildId;

  return (
    <Menu
      aria-label={`Action menu for user ${username}`}
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
          onSelected={action.onClick}
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
