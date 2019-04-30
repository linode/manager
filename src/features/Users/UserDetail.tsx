import { clone, compose, path as pathRamda } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TabLink from 'src/components/TabLink';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getUser, updateUser } from 'src/services/account';
import { handleUpdate } from 'src/store/profile/profile.actions';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getGravatarUrl } from 'src/utilities/gravatar';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';

type ClassNames = 'titleWrapper' | 'avatar' | 'backButton' | 'emptyImage';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  avatar: {
    margin: '0 8px 0 -4px',
    color: '#606469',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    animation: 'fadeIn 150ms linear forwards'
  },
  emptyImage: {
    width: 42,
    height: 49
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  backButton: {
    margin: '4px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    }
  }
});

interface MatchProps {
  username: string;
}

type CombinedProps = WithStyles<ClassNames> &
  RouteComponentProps<MatchProps> &
  StateProps &
  DispatchProps;

interface State {
  gravatarUrl?: string;
  error?: Error;
  originalUsername?: string;
  username: string;
  createdUsername?: string;
  email: string;
  restricted?: boolean;
  profileSaving: boolean;
  profileErrors?: Linode.ApiFieldError[];
  profileSuccess?: boolean;
}

class UserDetail extends React.Component<CombinedProps> {
  state: State = {
    profileSaving: false,
    email: '',
    username: ''
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'User Profile', routeName: `${this.props.match.url}/profile` },
    {
      title: 'User Permissions',
      routeName: `${this.props.match.url}/permissions`
    }
  ];

  componentDidMount() {
    const {
      match: {
        params: { username }
      }
    } = this.props;
    const {
      history,
      location: { state: locationState }
    } = this.props;

    getUser(username)
      .then(user => {
        getGravatarUrl(user.email).then(url => {
          this.setState({
            gravatarUrl: url,
            originalUsername: user.username,
            username: user.username,
            email: user.email,
            restricted: user.restricted
          });
        });
      })
      .catch(errResponse => {
        this.setState({
          error: new Error('Error fetching User data')
        });
      });

    if (locationState) {
      this.setState({
        profileSuccess: clone(locationState.success),
        createdUsername: clone(locationState.newUsername)
      });
      /* don't show the success message again on refresh */
      history.replace({
        pathname: history.location.pathname,
        state: {}
      });
    }
  }

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  clearNewUser = () => {
    this.setState({ createdUsername: undefined });
  };

  visitUsers = () => {
    const { history } = this.props;
    history.push('/account/users');
  };

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value
    });
  };

  onReset = () => {
    this.setState({
      username: this.state.originalUsername,
      profileErrors: [],
      profileSuccess: false
    });
  };

  onSave = () => {
    const {
      history,
      match: { path },
      profileUsername,
      actions: { updateCurrentUser }
    } = this.props;

    const { originalUsername, username, restricted } = this.state;

    if (!originalUsername) {
      return;
    }

    this.setState({
      profileSuccess: false,
      profileSaving: true,
      profileErrors: []
    });

    updateUser(originalUsername, { username, restricted })
      .then(user => {
        /**
         * Update the state of the component with the updated information.
         */
        this.setState({
          originalUsername: user.username,
          username: user.username,
          profileSaving: false
        });

        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         */
        if (profileUsername === originalUsername) {
          updateCurrentUser(user);
        }

        /**
         * I really have no idea whats going on here.
         */
        history.push(path.replace(':username', user.username), {
          success: true
        });
      })
      .catch(errResponse => {
        this.setState({
          profileErrors: getAPIErrorOrDefault(
            errResponse,
            'Error updating user profile'
          ),
          profileSaving: false
        });
      });
  };

  renderUserProfile = () => {
    const {
      username,
      email,
      profileSaving,
      profileSuccess,
      profileErrors
    } = this.state;
    return (
      <UserProfile
        username={username}
        email={email}
        changeUsername={this.onChangeUsername}
        save={this.onSave}
        reset={this.onReset}
        saving={profileSaving}
        success={profileSuccess || false}
        errors={profileErrors}
      />
    );
  };

  renderUserPermissions = () => {
    const { username } = this.state;
    const { profileUsername } = this.props;
    return (
      <UserPermissions
        currentUser={profileUsername}
        username={username}
        clearNewUser={this.clearNewUser}
      />
    );
  };

  matches = (p: string) => {
    return Boolean(matchPath(p, { path: this.props.location.pathname }));
  };

  clampTabChoice = () => {
    const tabChoice = this.tabs.findIndex(tab => this.matches(tab.routeName));
    return tabChoice < 0 ? 0 : tabChoice;
  };

  render() {
    const {
      classes,
      match: {
        url,
        params: { username }
      }
    } = this.props;
    const { error, gravatarUrl, createdUsername } = this.state;

    if (error) {
      return (
        <React.Fragment>
          <Grid container justify="space-between">
            <Grid item className={classes.titleWrapper}>
              <Breadcrumb
                linkTo="/account/users"
                linkText="Users"
                labelTitle={username || ''}
              />
            </Grid>
          </Grid>
          <ErrorState errorText="There was an error retrieving the user data. Please reload and try again." />
        </React.Fragment>
      );
    }

    const maybeGravatar =
      gravatarUrl === undefined ? (
        <div className={classes.emptyImage} />
      ) : gravatarUrl === 'not found' ? (
        <UserIcon className={classes.avatar} />
      ) : (
        <img
          alt={`user ${username}'s avatar`}
          src={gravatarUrl}
          className={classes.avatar}
        />
      );

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo="/account/users"
              linkText="Users"
              labelTitle={username}
              labelOptions={{ prefixComponent: maybeGravatar }}
            />
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <Tabs
            value={this.clampTabChoice()}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            {this.tabs.map(tab => (
              <Tab
                key={tab.title}
                data-qa-tab={tab.title}
                component={() => (
                  <TabLink to={tab.routeName} title={tab.title} />
                )}
              />
            ))}
          </Tabs>
        </AppBar>
        {createdUsername && (
          <Notice
            success
            text={`User ${createdUsername} created successfully`}
          />
        )}
        <Switch>
          <Route
            exact
            path={`${url}/permissions`}
            component={this.renderUserPermissions}
          />
          <Route path={`${url}`} render={this.renderUserProfile} />
        </Switch>
      </React.Fragment>
    );
  }
}

interface StateProps {
  profileUsername?: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  profileUsername: pathRamda(['data', 'username'], state.__resources.profile)
});

interface DispatchProps {
  actions: {
    updateCurrentUser: (user: Linode.User) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  actions: {
    updateCurrentUser: (u: Linode.User) => dispatch(handleUpdate(u))
  }
});

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.username !==
      routePropsNew.match.params.username
    );
  }
);

const styled = withStyles(styles);

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<any, any, any, any>(
  connected,
  styled,
  reloadable
)(UserDetail);
