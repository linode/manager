import { useProfile } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { PickPermissions } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type UserActionMenuPermissions = PickPermissions<
  'delete_user' | 'is_account_admin'
>;

interface Props {
  isProxyUser: boolean;
  onDelete: (username: string) => void;
  permissions: Record<UserActionMenuPermissions, boolean>;

  username: string;
}

export const UsersActionMenu = (props: Props) => {
  const { isProxyUser, onDelete, permissions, username } = props;

  const navigate = useNavigate();

  const { data: profile } = useProfile();
  const profileUsername = profile?.username;
  const isAccountAdmin = permissions.is_account_admin;
  const canDeleteUser = permissions.delete_user;

  const proxyUserActions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/roles',
          params: { username },
        });
      },
      disabled: !isAccountAdmin,
      tooltip: !isAccountAdmin
        ? 'You do not have permission to manage access.'
        : undefined,
      title: 'Manage Access',
    },
  ];

  const nonProxyUserActions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/details',
          params: { username },
        });
      },
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
      disabled: username === profileUsername || !canDeleteUser,
      onClick: () => {
        onDelete(username);
      },
      title: 'Delete User',
      tooltip:
        username === profileUsername
          ? "You can't delete the currently active user."
          : !canDeleteUser
            ? 'You do not have permission to delete this user.'
            : undefined,
    },
  ];

  const actions = isProxyUser ? proxyUserActions : nonProxyUserActions;

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for user ${profileUsername}`}
    />
  );
};
