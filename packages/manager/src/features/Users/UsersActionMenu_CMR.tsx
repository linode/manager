import * as React from 'react';
import useProfile from 'src/hooks/useProfile';
import { useHistory } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  username: string;
  onDelete: (username: string) => void;
}

type CombinedProps = Props;

const UsersActionMenu: React.FC<CombinedProps> = props => {
  const history = useHistory();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { onDelete, username } = props;
  const { profile } = useProfile();
  const profileUsername = profile.data?.username;

  const actions: Action[] = [
    {
      title: 'User Profile',
      onClick: () => {
        history.push(`/account/users/${username}`);
      }
    },
    {
      title: 'User Permissions',
      onClick: () => {
        history.push(`/account/users/${username}/permissions`);
      }
    },
    {
      disabled: username === profileUsername,
      title: 'Delete',
      onClick: () => {
        onDelete(username);
      },
      tooltip:
        username === profileUsername
          ? "You can't delete the currently active user."
          : undefined
    }
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for user ${profileUsername}`}
        />
      ) : (
        actions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
              disabled={action.disabled}
            />
          );
        })
      )}
    </>
  );
};

export default UsersActionMenu;
