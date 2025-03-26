import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { useProfile } from 'src/queries/profile/profile';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  isProxyUser: boolean;
  onDelete: (username: string) => void;
  username: string;
}

export const UsersActionMenu = ({ isProxyUser, onDelete, username }: Props) => {
  const history = useHistory();

  const { data: profile } = useProfile();
  const profileUsername = profile?.username;

  const proxyUserActions: Action[] = [
    {
      onClick: () => {
        history.push(`/iam/users/${username}/roles`);
      },
      title: 'Manage Access',
    },
  ];

  const nonProxyUserActions: Action[] = [
    {
      onClick: () => {
        history.push(`/iam/users/${username}/details`);
      },
      title: 'View User Details',
    },
    {
      onClick: () => {
        history.push(`/iam/users/${username}/roles`);
      },
      title: 'View Assigned Roles',
    },
    {
      onClick: () => {
        history.push(`/iam/users/${username}/entities`);
      },
      title: 'View Assigned Entities',
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
