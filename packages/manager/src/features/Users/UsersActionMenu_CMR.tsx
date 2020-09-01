import * as React from 'react';
import useProfile from 'src/hooks/useProfile';
import { useHistory } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  username: string;
  onDelete: (username: string) => void;
}

type CombinedProps = Props;

const useStyles = makeStyles(() => ({
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& a': {
      lineHeight: '1rem'
    }
  }
}));

const UsersActionMenu: React.FC<CombinedProps> = props => {
  const { onDelete, username } = props;

  const history = useHistory();

  const { profile } = useProfile();
  const profileUsername = profile.data?.username;

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const actions: Action[] = [
    {
      title: 'User Profile',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(`/account/users/${username}`);
        e.preventDefault();
      }
    },
    {
      title: 'User Permissions',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(`/account/users/${username}/permissions`);
        e.preventDefault();
      }
    },
    {
      disabled: username === profileUsername,
      title: 'Delete',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        onDelete(username);
        e.preventDefault();
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
        <div className={classes.actionInner}>
          {actions.map(action => {
            return (
              <InlineMenuAction
                key={action.title}
                actionText={action.title}
                onClick={action.onClick}
                disabled={action.disabled}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default UsersActionMenu;
