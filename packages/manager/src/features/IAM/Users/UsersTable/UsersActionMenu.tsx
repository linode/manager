import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import { useDelegationRole } from '../../hooks/useDelegationRole';

import type { PickPermissions, UserType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type UserActionMenuPermissions = PickPermissions<
  'delete_user' | 'is_account_admin'
>;

interface Props {
  onDelete: (username: string) => void;
  permissions: Record<UserActionMenuPermissions, boolean>;
  username: string;
  userType?: UserType;
}

export const UsersActionMenu = (props: Props) => {
  const { onDelete, permissions, username, userType } = props;
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

  const navigate = useNavigate();
  const { isChildAccount, isParentAccount, profileUserName } =
    useDelegationRole();

  const isAccountAdmin = permissions.is_account_admin;
  const canDeleteUser = permissions.delete_user;
  const isDelegateUser = userType === 'delegate';

  // Determine if the current account is a child account with isIAMDelegationEnabled enabled
  // If so, we need to hide 'View User Details', 'Delete User', 'View Account Delegations' in the menu
  const shouldHideForChildDelegate =
    isIAMDelegationEnabled && isChildAccount && isDelegateUser;

  const actions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/details',
          params: { username },
        });
      },
      hidden: shouldHideForChildDelegate,
      disabled: !isAccountAdmin,
      tooltip: !isAccountAdmin
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
      disabled: !isAccountAdmin,
      tooltip: !isAccountAdmin
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
      disabled: !isAccountAdmin,
      tooltip: !isAccountAdmin
        ? 'You do not have permission to view entity access.'
        : undefined,
      title: 'View Entity Access',
    },
    {
      disabled: false,
      hidden: !isIAMDelegationEnabled || !isParentAccount,
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

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for user ${profileUserName}`}
    />
  );
};
