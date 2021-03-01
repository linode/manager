import { getUser, updateUser } from '@linode/api-v4/lib/account';
import { updateProfile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { clone, path as pathRamda } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { requestProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getGravatarUrl } from 'src/utilities/gravatar';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';

interface MatchProps {
  username: string;
}

type CombinedProps = RouteComponentProps<MatchProps> &
  StateProps &
  DispatchProps;

interface State {
  gravatarUrl?: string;
  error?: string;
  originalUsername?: string;
  username: string;
  createdUsername?: string;
  originalEmail?: string;
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
    username: '',
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'User Profile',
      routeName: `${this.props.match.url}/profile`,
    },
    {
      title: 'User Permissions',
      routeName: `${this.props.match.url}/permissions`,
    },
  ];

  componentDidMount() {
    const {
      match: {
        params: { username },
      },
    } = this.props;
    const {
      history,
      location: { state: locationState },
    } = this.props;

    getUser(username)
      .then((user) => {
        getGravatarUrl(user.email).then((url) => {
          this.setState({
            gravatarUrl: url,
            originalUsername: user.username,
            username: user.username,
            originalEmail: user.email,
            email: user.email,
            restricted: user.restricted,
          });
        });
      })
      .catch((errorResponse) => {
        this.setState({
          error: getAPIErrorOrDefault(
            errorResponse,
            'Error loading user data.'
          )[0].reason,
        });
      });

    if (locationState) {
      this.setState({
        accountSuccess: clone(locationState.success),
        createdUsername: clone(locationState.newUsername),
      });
      /* don't show the success message again on refresh */
      history.replace({
        pathname: history.location.pathname,
        state: {},
      });
    }
  }

  clearNewUser = () => {
    this.setState({ createdUsername: undefined });
  };

  visitUsers = () => {
    const { history } = this.props;
    history.push('/account/users');
  };

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value,
    });
  };

  onReset = () => {
    this.setState({
      username: this.state.originalUsername,
      profileErrors: [],
      profileSuccess: false,
    });
  };

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  };

  onSaveAccount = () => {
    const {
      history,
      match: { path },
      profileUsername,
      refreshProfile,
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
      profileErrors: [],
    });

    updateUser(originalUsername, { username, restricted })
      .then((user) => {
        /**
         * Update the state of the component with the updated information.
         */
        this.setState({
          originalUsername: user.username,
          username: user.username,
          accountSaving: false,
          accountErrors: undefined,
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
          success: true,
        });
      })
      .catch((errResponse) => {
        this.setState({
          accountErrors: getAPIErrorOrDefault(
            errResponse,
            'Error updating username'
          ),
          accountSaving: false,
          accountSuccess: false,
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
      accountErrors: [],
    });

    updateProfile({ email })
      .then((profile) => {
        this.setState({
          profileSaving: false,
          profileSuccess: true,
          profileErrors: undefined,
        });
        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         */
        if (profile.username === originalUsername) {
          refreshProfile();
        }
      })
      .catch((errResponse) => {
        this.setState({
          profileErrors: getAPIErrorOrDefault(
            errResponse,
            'Error updating email'
          ),
          profileSaving: false,
          profileSuccess: false,
        });
      });
  };

  matches = (p: string) => {
    return Boolean(matchPath(p, { path: this.props.location.pathname }));
  };

  clampTabChoice = () => {
    const tabChoice = this.tabs.findIndex((tab) => this.matches(tab.routeName));
    return tabChoice < 0 ? 0 : tabChoice;
  };

  render() {
    const { location, profileUsername } = this.props;
    const {
      error,
      createdUsername,
      username,
      email,
      profileSaving,
      profileSuccess,
      profileErrors,
      accountSaving,
      accountSuccess,
      accountErrors,
      originalUsername,
      originalEmail,
    } = this.state;

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
          <ErrorState errorText={error} />
        </React.Fragment>
      );
    }

    const navToURL = (index: number) => {
      this.props.history.push(this.tabs[index].routeName);
    };

    return (
      <>
        <Breadcrumb
          pathname={location.pathname}
          labelTitle={username}
          labelOptions={{
            noCap: true,
          }}
          crumbOverrides={[
            {
              position: 2,
              label: 'Users',
              linkTo: {
                pathname: `/account/users`,
              },
            },
          ]}
          removeCrumbX={4}
        />
        <Tabs defaultIndex={this.clampTabChoice()} onChange={navToURL}>
          <TabLinkList tabs={this.tabs} />

          {createdUsername && (
            <Notice
              success
              text={`User ${createdUsername} created successfully`}
            />
          )}
          <TabPanels>
            <SafeTabPanel index={0}>
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
                originalEmail={originalEmail}
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <UserPermissions
                currentUser={profileUsername}
                username={username}
                clearNewUser={this.clearNewUser}
              />
            </SafeTabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  }
}

interface StateProps {
  profileUsername?: string;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  profileUsername: pathRamda(['data', 'username'], state.__resources.profile),
});

interface DispatchProps {
  refreshProfile: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => ({
  refreshProfile: () => dispatch(requestProfile() as any),
});

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.username !==
      routePropsNew.match.params.username
    );
  }
);

export const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(connected, reloadable)(UserDetail);
