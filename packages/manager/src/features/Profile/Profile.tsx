import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import Tab from 'src/components/core/Tab';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import H1Header from 'src/components/H1Header';
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
      routeName: `${this.props.match.url}/display`
    },
    {
      title: 'Password & Authentication',
      routeName: `${this.props.match.url}/auth`
    },
    {
      title: 'SSH Keys',
      routeName: `${this.props.match.url}/keys`
    },
    {
      title: 'LISH',
      routeName: `${this.props.match.url}/lish`
    },
    {
      title: 'API Tokens',
      routeName: `${this.props.match.url}/tokens`
    },
    {
      title: 'OAuth Apps',
      routeName: `${this.props.match.url}/clients`
    },
    {
      title: 'Referrals',
      routeName: `${this.props.match.url}/referrals`
    },
    {
      title: 'Settings',
      routeName: `${this.props.match.url}/settings`
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
        <H1Header title="My Profile" data-qa-profile-header />
        <Tabs
        // value={this.tabs.findIndex(tab => matches(tab.routeName))}
        // onChange={this.handleTabChange}
        // indicatorColor="primary"
        // textColor="primary"
        // variant="scrollable"
        // scrollButtons="on"
        // data-qa-tabs
        >
          <TabList>
            {this.tabs.map(tab => (
              <Tab key={tab.title} data-qa-tab={tab.title}>
                <TabLink to={tab.routeName} title={tab.title} />
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel>
              <DisplaySettings />
            </TabPanel>
            <TabPanel>
              <AuthenticationSettings />
            </TabPanel>
            <TabPanel>
              <SSHKeys />
            </TabPanel>
            <TabPanel>
              <LishSettings />
            </TabPanel>
            <TabPanel>
              <APITokens />
            </TabPanel>
            <TabPanel>
              <OAuthClients />
            </TabPanel>
            <TabPanel>
              <Referrals />
            </TabPanel>
            <TabPanel>
              <Settings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </React.Fragment>
    );
  }
}

export default withRouter(Profile);
