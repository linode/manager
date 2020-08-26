import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { MapState } from 'src/store/types';
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

type CombinedProps = Props & StateProps & RouteComponentProps<{}>;

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
  const {
    onDelete,
    username,
    profileUsername,
    history: { push }
  } = props;

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const actions: Action[] = [
    {
      title: 'User Profile',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        push(`/account/users/${username}`);
        e.preventDefault();
      }
    },
    {
      title: 'User Permissions',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        push(`/account/users/${username}/permissions`);
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
          ariaLabel={`Action menu for user ${props.profileUsername}`}
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
interface StateProps {
  profileUsername?: string;
}

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => ({
  profileUsername: path(['data', 'username'], state.__resources.profile)
});

export const connected = connect(mapStateToProps);

export default withRouter(connected(UsersActionMenu));
