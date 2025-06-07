import { useProfile } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  isProxyUser: boolean;
  onDelete: (username: string) => void;
  username: string;
}

export const UsersActionMenu = ({ isProxyUser, onDelete, username }: Props) => {
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
      title: 'View User Details',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/roles',
          params: { username },
        });
      },
      title: 'View Assigned Roles',
    },
    {
      onClick: () => {
        navigate({
          to: '/iam/users/$username/entities',
          params: { username },
        });
      },
      title: 'View Entity Access',
    },
    {
      disabled: username === profileUsername,
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
