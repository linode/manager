import { equals, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { matchPath, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import UserIcon from 'src/assets/icons/user.svg';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getUser, updateUser } from 'src/services/account';
import { getProfile } from 'src/services/profile';
import { request, response } from 'src/store/reducers/resources';
import { getGravatarUrl } from 'src/utilities/gravatar';

import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';

type ClassNames = 'titleWrapper' | 'avatar' | 'backButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  avatar: {
    margin: '0 8px 0 -4px',
    color: '#666',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '4px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    }
  },
});

interface ConnectedProps {
  request: typeof request;
  response: typeof response;
  profileUsername: string;
}

interface MatchProps { username: string };
type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<MatchProps> & ConnectedProps;

interface State {
  gravatarUrl: string;
  error?: Error,
  originalUsername?: string;
  username?: string;
  email?: string;
  restricted?: boolean;
  profileSaving: boolean;
  profileErrors?: Linode.ApiFieldError[];
  profileSuccess?: boolean;
}

class Profile extends React.Component<CombinedProps> {
  state: State = {
    gravatarUrl: 'not found',
    profileSaving: false,
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'User Profile', routeName: `${this.props.match.url}/profile` },
    { title: 'User Permissions', routeName: `${this.props.match.url}/permissions` },
  ];

  componentDidMount() {
    const { match: { params: { username } } } = this.props;
    const { location: { state: locationState } } = this.props;
    getUser(username)
      .then((user) => {
        getGravatarUrl(user.email)
          .then((url) => {
            this.setState({
              gravatarUrl: url,
              originalUsername: user.username,
              username: user.username,
              email: user.email,
              restricted: user.restricted,
            })
          })
      })
      .catch((errResponse) => {
        this.setState({
          error: new Error("Error fetching User data"),
        })
      })

    if (locationState) {
      this.setState({
        profileSuccess: locationState.success,
      });
    }
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const { location: { state: locationState } } = this.props;
    if (!equals(locationState, prevProps.location.state)) {
      if (locationState) {
        this.setState({
          profileSuccess: locationState.success,
        });
      } else {
        this.setState({
          profileSuccess: false,
        });
      }
    }
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  visitUsers = () => {
    const { history } = this.props;
    history.push('/users');
  }

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value,
    });
  }

  onReset = () => {
    this.setState({
      username: this.state.originalUsername,
      profileErrors: [],
      profileSuccess: false,
    })
  }

  onSave = () => {
    const { history, match: { path }, profileUsername, request, response } = this.props;
    const { originalUsername, username, restricted } = this.state;
    if (!originalUsername) { return; }
    this.setState({
      profileSuccess: false,
      profileSaving: true,
      profileErrors: [],
    })
    updateUser(originalUsername, { username, restricted })
      .then((user) => {
        this.setState({
          originalUsername: user.username,
          username: user.username,
          profileSaving: false,
        })
        if (profileUsername === originalUsername) {
          request(['profile']);
          getProfile()
            .then(({ data }) => {
              response(['profile'], data);
            })
            .catch(error => response(['profile'], error));
        }
        history.push(path.replace(':username', user.username), { success: true });
      })
      .catch((errResponse) => {
        const errors = pathOr([
          { reason: 'An unexpected error occured while saving' }
        ], ['response', 'data', 'errors'], errResponse);
        this.setState({
          profileErrors: errors,
          profileSaving: false,
        });
      });
  }

  renderUserProfile = () => {
    const { username, email, profileSaving, profileSuccess, profileErrors } = this.state;
    return <UserProfile
      username={username}
      email={email}
      changeUsername={this.onChangeUsername}
      save={this.onSave}
      reset={this.onReset}
      saving={profileSaving}
      success={profileSuccess || false}
      errors={profileErrors}
    />
  }

  matches = (p: string) => {
    return Boolean(matchPath(p, { path: this.props.location.pathname }));
  };

  clampTabChoice = () => {
    const tabChoice = this.tabs.findIndex(tab => this.matches(tab.routeName))
    return tabChoice < 0 ? 0 : tabChoice;
  }

  render() {
    const {
      classes,
      match: { url, params: { username } },
      location: { state: locationState },
    } = this.props;
    const { error, gravatarUrl } = this.state;

    if (error) {
      return (
        <React.Fragment>
          <IconButton onClick={this.visitUsers} className={classes.backButton}>
            <KeyboardArrowLeft />
          </IconButton>
          <ErrorState
            errorText="There was an error retrieving the user data. Please reload and try again."
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <IconButton onClick={this.visitUsers} className={classes.backButton}>
              <KeyboardArrowLeft />
            </IconButton>
            {gravatarUrl !== 'not found'
              ? <img
                alt={`user ${username}'s avatar`}
                src={gravatarUrl}
                className={classes.avatar}
              />
              : <UserIcon className={classes.avatar} />
            }
            <Typography variant="headline">
              {username}
            </Typography>
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <Tabs
            value={this.clampTabChoice()}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
          </Tabs>
        </AppBar>
        {locationState && locationState.newUsername &&
          <Notice success text={`User ${locationState.newUsername} created successfully`} /> 
        }
        <Switch>
          <Route exact path={`${url}/permissions`} component={UserPermissions} />
          <Route path={`${url}`} render={this.renderUserProfile} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { request, response },
  dispatch,
);

const mapStateToProps = (state: Linode.AppState) => ({
  profileUsername: pathOr('', ['resources', 'profile', 'data', 'username'], state),
});

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>((routePropsOld, routePropsNew) => {
  return routePropsOld.match.params.username !== routePropsNew.match.params.username;
})

const styled = withStyles(styles, { withTheme: true });

export const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(styled(reloadable(Profile)));
