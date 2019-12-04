import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TabLink from 'src/components/TabLink';

import DefaultLoader from 'src/components/DefaultLoader';

const SSHKeys = DefaultLoader({
  loader: () => import('./SSHKeys')
});

const Settings = DefaultLoader({
  loader: () => import('./Settings')
});

const Referrals = DefaultLoader({
  loader: () => import('./Referrals')
});

const OAuthClients = DefaultLoader({
  loader: () => import('./OAuthClients')
});

const LishSettings = DefaultLoader({
  loader: () => import('./LishSettings')
});

const DisplaySettings = DefaultLoader({
  loader: () => import('./DisplaySettings')
});

const AuthenticationSettings = DefaultLoader({
  loader: () => import('./AuthenticationSettings')
});

const APITokens = DefaultLoader({
  loader: () => import('./APITokens')
});

type Props = RouteComponentProps<{}>;

class Profile extends React.Component<Props> {
  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Display',
      routeName: `${this.props.match.url}/display`,
      name: 'profile-display'
    },
    {
      title: 'Password & Authentication',
      routeName: `${this.props.match.url}/auth`,
      name: 'profile-auth'
    },
    {
      title: 'SSH Keys',
      routeName: `${this.props.match.url}/keys`,
      name: 'profile-keys'
    },
    {
      title: 'LISH',
      routeName: `${this.props.match.url}/lish`,
      name: 'profile-lish'
    },
    {
      title: 'API Tokens',
      routeName: `${this.props.match.url}/tokens`,
      name: 'profile-tokens'
    },
    {
      title: 'OAuth Apps',
      routeName: `${this.props.match.url}/clients`,
      name: 'profile-clients'
    },
    {
      title: 'Referrals',
      routeName: `${this.props.match.url}/referrals`,
      name: 'profile-referrals'
    },
    {
      title: 'Settings',
      routeName: `${this.props.match.url}/settings`,
      name: 'profile-settings'
    }
  ];

  render() {
    const {
      match: { url }
    } = this.props;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="My Profile" />
        <Typography variant="h1" data-qa-profile-header>
          My Profile
        </Typography>
        <AppBar position="static" color="default" role="tablist">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
            data-qa-tabs
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
        <Switch>
          <Route exact path={`${url}/settings`} component={Settings} />
          <Route
            exact
            path={`${url}/auth`}
            component={AuthenticationSettings}
          />
          <Route exact path={`${url}/tokens`} component={APITokens} />
          <Route exact path={`${url}/clients`} component={OAuthClients} />
          <Route exact path={`${url}/lish`} component={LishSettings} />
          <Route exact path={`${url}/referrals`} component={Referrals} />
          <Route exact path={`${url}/keys`} component={SSHKeys} />
          <Route path={`${url}`} component={DisplaySettings} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(Profile);
