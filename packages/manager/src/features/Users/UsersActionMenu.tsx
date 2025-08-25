import { useProfile } from '@linode/queries';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useFlags } from 'src/hooks/useFlags';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  isProxyUser: boolean;
  onDelete: (username: string) => void;
  username: string;
}

export const UsersActionMenu = ({ isProxyUser, onDelete, username }: Props) => {
  const navigate = useNavigate();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { iamRbacPrimaryNavChanges } = useFlags();

  const { data: profile } = useProfile();
  const profileUsername = profile?.username;

  const proxyUserActions: Action[] = [
    {
      onClick: () => {
        navigate({
          to: iamRbacPrimaryNavChanges
            ? '/users/$username/permissions'
            : '/account/users/$username/permissions',
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
          to: iamRbacPrimaryNavChanges
            ? '/users/$username'
            : '/account/users/$username',
          params: { username },
        });
      },
      title: 'User Profile',
    },
    {
      onClick: () => {
        navigate({
          to: iamRbacPrimaryNavChanges
            ? '/users/$username/permissions'
            : '/account/users/$username/permissions',
          params: { username },
        });
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
