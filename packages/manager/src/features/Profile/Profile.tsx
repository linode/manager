import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import H1Header from 'src/components/H1Header';
import SuspenseLoader from 'src/components/SuspenseLoader';
import Props from './OAuthClients';

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

class Profile extends React.Component<Props> {
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
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="My Profile" />
        <H1Header title="My Profile" data-qa-profile-header />
        <Tabs
          defaultIndex={this.tabs.findIndex(tab => matches(tab.routeName))}
          data-qa-tabs
        >
          <TabLinkList tabs={this.tabs} />

          <React.Suspense fallback={<SuspenseLoader />}>
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
                {/* TODO figure this out */}
                <OAuthClients />
              </TabPanel>
              <TabPanel>
                <Referrals />
              </TabPanel>
              <TabPanel>
                <Settings />
              </TabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </React.Fragment>
    );
  }
}

export default withRouter(Profile);
