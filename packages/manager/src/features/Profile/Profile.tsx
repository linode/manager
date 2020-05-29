import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import H1Header from 'src/components/H1Header';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLink from 'src/components/TabLink';

const SSHKeys = React.lazy(() => import('./SSHKeys'));
const Settings = React.lazy(() => import('./Settings'));
const Referrals = React.lazy(() => import('./Referrals'));
const OAuthClients = React.lazy(() => import('./OAuthClients'));
const LishSettings = React.lazy(() => import('./LishSettings'));
const DisplaySettings = React.lazy(() => import('./DisplaySettings'));
const AuthenticationSettings = React.lazy(() =>
  import('./AuthenticationSettings')
);
const APITokens = React.lazy(() => import('./APITokens'));

type Props = RouteComponentProps<{}>;

const Profile: React.FC<Props> = props => {
  const {
    match: { url }
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Display',
      routeName: `${url}/display`
    },
    {
      title: 'Password & Authentication',
      routeName: `${url}/auth`
    },
    {
      title: 'SSH Keys',
      routeName: `${url}/keys`
    },
    {
      title: 'LISH',
      routeName: `${url}/lish`
    },
    {
      title: 'API Tokens',
      routeName: `${url}/tokens`
    },
    {
      title: 'OAuth Apps',
      routeName: `${url}/clients`
    },
    {
      title: 'Referrals',
      routeName: `${url}/referrals`
    },
    {
      title: 'Settings',
      routeName: `${url}/settings`
    }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile" />
      <H1Header title="My Profile" data-qa-profile-header />
      <AppBar position="static" color="default" role="tablist">
        <Tabs
          // Prevent console error for -1 as invalid tab index if we're redirecting from e.g. /profile/invalid-route
          value={Math.max(
            0,
            tabs.findIndex(tab => matches(tab.routeName))
          )}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
          data-qa-tabs
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((props, ref) => (
                <TabLink
                  to={tab.routeName}
                  title={tab.title}
                  {...props}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
      <React.Suspense fallback={<SuspenseLoader />}>
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
          <Route exact path={`${url}/display`} component={DisplaySettings} />
          <Redirect to={`${url}/display`} />
        </Switch>
      </React.Suspense>
    </React.Fragment>
  );
};

export default withRouter(Profile);
