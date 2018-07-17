import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';


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
import { getUser } from 'src/services/account';
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

type Props = WithStyles<ClassNames> & RouteComponentProps<{ username: string }>;

interface State {
  gravatarUrl: string;
  error?: Error,
  originalUsername?: string;
  username?: string;
  originalEmail?: string;
  email?: string;
  restricted?: boolean;
}

class Profile extends React.Component<Props> {
  state: State = {
    gravatarUrl: 'not found',
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'User Profile', routeName: `${this.props.match.url}/profile` },
    { title: 'User Permissions', routeName: `${this.props.match.url}/permissions` },
  ];

  componentDidMount() {
    const { match: { params: { username } } } = this.props;
    getUser(username)
      .then((user) => {
        getGravatarUrl(user.email)
          .then((url) => {
            this.setState({
              gravatarUrl: url,
              originalUsername: user.username,
              username: user.username,
              originalEmail: user.email,
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

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  }

  onReset = () => {
    this.setState({
      username: this.state.originalUsername,
      email: this.state.originalEmail,
    })
  }

  onSave = () => {
    return;
  }

  renderUserProfile = () => {
    const { username, email } = this.state;
    return <UserProfile
      username={username}
      email={email}
      changeUsername={this.onChangeUsername}
      changeEmail={this.onChangeEmail}
      save={this.onSave}
      reset={this.onReset}
    />
  }

  render() {
    const { classes, match: { url, params: { username } } } = this.props;
    const { error, gravatarUrl } = this.state;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    if (error) {
      return (
        <ErrorState
          errorText="There was an error retrieving the user data. Please reload and try again."
        />
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
              ? <img src={gravatarUrl} className={classes.avatar} />
              : <UserIcon className={classes.avatar} />
            }
            <Typography variant="headline">
              {username}
            </Typography>
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/permissions`} component={UserPermissions} />
          <Route path={`${url}`} render={this.renderUserProfile} />
        </Switch>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default withRouter(styled(Profile));
