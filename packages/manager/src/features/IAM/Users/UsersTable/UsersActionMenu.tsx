import { useProfile } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { PickPermissions } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type UserActionMenuPermissions = PickPermissions<
  'delete_user' | 'list_user_grants' | 'view_user'
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

  const proxyUserActions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/roles',
          params: { username },
        });
      },
      disabled: !permissions.list_user_grants,
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
      disabled: !permissions.view_user,
      title: 'View User Details',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/roles',
          params: { username },
        });
      },
      disabled: !permissions.list_user_grants,
      title: 'View Assigned Roles',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/entities',
          params: { username },
        });
      },
      disabled: !permissions.list_user_grants,
      title: 'View Entity Access',
    },
    {
      disabled: username === profileUsername || !permissions.delete_user,
      onClick: () => {
        onDelete(username);
      },
      title: 'Delete User',
      tooltip:
        username === profileUsername
          ? "You can't delete the currently active user."
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
