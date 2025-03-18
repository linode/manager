import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useProfile } from '@linode/queries';

interface Props {
  isProxyUser: boolean;
  onDelete: (username: string) => void;
  username: string;
}

export const UsersActionMenu = ({ isProxyUser, onDelete, username }: Props) => {
  const history = useHistory();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { data: profile } = useProfile();
  const profileUsername = profile?.username;

  const proxyUserActions: Action[] = [
    {
      onClick: () => {
        history.push(`/account/users/${username}/permissions`);
      },
      title: 'Manage Access',
    },
  ];

  const nonProxyUserActions: Action[] = [
    {
      onClick: () => {
        history.push(`/account/users/${username}`);
      },
      title: 'User Profile',
    },
    {
      onClick: () => {
        history.push(`/account/users/${username}/permissions`);
      },
      title: 'User Permissions',
    },
    {
      disabled: username === profileUsername,
      onClick: () => {
        onDelete(username);
      },
      title: 'Delete',
      tooltip:
        username === profileUsername
          ? "You can't delete the currently active user."
          : undefined,
    },
  ];

  const actions = isProxyUser ? proxyUserActions : nonProxyUserActions;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for user ${profileUsername}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};
