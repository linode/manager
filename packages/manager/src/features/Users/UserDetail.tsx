import { getUser, updateUser } from 'linode-js-sdk/lib/account';
import { updateProfile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import { clone, compose, path as pathRamda } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TabLink from 'src/components/TabLink';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { requestProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getGravatarUrl } from 'src/utilities/gravatar';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';

type ClassNames = 'avatar' | 'backButton' | 'emptyImage';

const styles = (theme: Theme) =>
  createStyles({
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
      width: 34,
      height: 34,
      animation: '$fadeIn 150ms linear forwards'
    },
    emptyImage: {
      width: 42,
      height: 49
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
  accountSaving: boolean;
  accountErrors?: APIError[];
  accountSuccess?: boolean;
  profileSaving: boolean;
  profileErrors?: APIError[];
  profileSuccess?: boolean;
}

class UserDetail extends React.Component<CombinedProps> {
  state: State = {
    accountSaving: false,
    profileSaving: false,
    email: '',
    username: ''
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'User Profile',
      routeName: `${this.props.match.url}/profile`,
      name: 'user-profile'
    },
    {
      title: 'User Permissions',
      routeName: `${this.props.match.url}/permissions`,
      name: 'user-permissions'
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
        accountSuccess: clone(locationState.success),
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

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value
    });
  };

  onSaveAccount = () => {
    const {
      history,
      match: { path },
      profileUsername,
      refreshProfile
    } = this.props;

    const { originalUsername, username, restricted } = this.state;

    if (!originalUsername) {
      return;
    }

    this.setState({
      accountSuccess: false,
      accountSaving: true,
      accountErrors: [],
      profileSuccess: false,
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
          accountSaving: false,
          accountErrors: undefined
        });

        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         */
        if (profileUsername === originalUsername) {
          refreshProfile();
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
          accountErrors: getAPIErrorOrDefault(
            errResponse,
            'Error updating username'
          ),
          accountSaving: false,
          accountSuccess: false
        });
      });
  };

  onSaveProfile = () => {
    const { email, originalUsername } = this.state;
    const { refreshProfile } = this.props;

    this.setState({
      profileSuccess: false,
      profileSaving: true,
      profileErrors: [],
      accountSuccess: false,
      accountErrors: []
    });

    updateProfile({ email })
      .then(profile => {
        this.setState({
          profileSaving: false,
          profileSuccess: true,
          profileErrors: undefined
        });
        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         */
        if (profile.username === originalUsername) {
          refreshProfile();
        }
      })
      .catch(errResponse => {
        this.setState({
          profileErrors: getAPIErrorOrDefault(
            errResponse,
            'Error updating email'
          ),
          profileSaving: false,
          profileSuccess: false
        });
      });
  };

  renderUserProfile = () => {
    const {
      username,
      email,
      profileSaving,
      profileSuccess,
      profileErrors,
      accountSaving,
      accountSuccess,
      accountErrors,
      originalUsername
    } = this.state;
    return (
      <UserProfile
        username={username}
        email={email}
        changeUsername={this.onChangeUsername}
        changeEmail={this.onChangeEmail}
        saveAccount={this.onSaveAccount}
        accountSaving={accountSaving}
        accountSuccess={accountSuccess || false}
        accountErrors={accountErrors}
        saveProfile={this.onSaveProfile}
        profileSaving={profileSaving}
        profileSuccess={profileSuccess || false}
        profileErrors={profileErrors}
        originalUsername={originalUsername}
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
      },
      location
    } = this.props;
    const { error, gravatarUrl, createdUsername } = this.state;

    if (error) {
      return (
        <React.Fragment>
          <Grid container justify="space-between">
            <Grid item>
              <Breadcrumb
                pathname={location.pathname}
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
          <Grid item>
            <Breadcrumb
              pathname={location.pathname}
              labelTitle={username}
              labelOptions={{
                prefixComponent: maybeGravatar,
                prefixStyle: { height: 34, marginTop: 2 },
                noCap: true
              }}
              removeCrumbX={3}
            />
          </Grid>
        </Grid>
        <AppBar position="static" color="default" role="tablist">
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
                component={React.forwardRef((props, ref) => (
                  <TabLink
                    to={tab.routeName}
                    idName={tab.name}
                    title={tab.title}
                    {...props}
                    ref={ref}
                  />
                ))}
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
          <Route
            path={`${url}/profile`}
            render={this.renderUserProfile}
            exact
          />
          <Redirect to={`${url}/profile`} />
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
  refreshProfile: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  refreshProfile: () => dispatch(requestProfile() as any)
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
  reloadable,
  styled
)(UserDetail);
