import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useProfile } from 'src/queries/profile';

interface Props {
  onDelete: (username: string) => void;
  username: string;
}

type CombinedProps = Props;

const UsersActionMenu: React.FC<CombinedProps> = (props) => {
  const history = useHistory();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { onDelete, username } = props;
  const { data: profile } = useProfile();
  const profileUsername = profile?.username;

  const actions: Action[] = [
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

export default UsersActionMenu;
