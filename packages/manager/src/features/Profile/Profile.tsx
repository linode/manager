import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import H1Header from 'src/components/H1Header';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';
import Props from './OAuthClients';

const SSHKeys = React.lazy(() => import('./SSHKeys'));
const SSHKeys_CMR = React.lazy(() => import('./SSHKeys/SSHKeys_CMR'));
const Settings = React.lazy(() => import('./Settings'));
const Referrals = React.lazy(() => import('./Referrals'));
const OAuthClients = React.lazy(() => import('./OAuthClients'));
const OAuthClients_CMR = React.lazy(() =>
  import('./OAuthClients/OAuthClients_CMR')
);
const LishSettings = React.lazy(() => import('./LishSettings'));
const DisplaySettings = React.lazy(() => import('./DisplaySettings'));
const AuthenticationSettings = React.lazy(() =>
  import('./AuthenticationSettings')
);
const APITokens = React.lazy(() => import('./APITokens'));

type Props = RouteComponentProps<{}>;

const Profile: React.FC<Props> = props => {
  const flags = useFlags();
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

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile " />
      <H1Header title="My Profile" data-qa-profile-header />
      <Tabs
        defaultIndex={tabs.findIndex(tab => matches(tab.routeName))}
        data-qa-tabs
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <DisplaySettings />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <AuthenticationSettings />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              {flags.cmr ? <SSHKeys_CMR /> : <SSHKeys />}
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <LishSettings />
            </SafeTabPanel>
            <SafeTabPanel index={4}>
              <APITokens />
            </SafeTabPanel>
            <SafeTabPanel index={5}>
              {flags.cmr ? <OAuthClients_CMR /> : <OAuthClients />}
            </SafeTabPanel>
            <SafeTabPanel index={6}>
              <Referrals />
            </SafeTabPanel>
            <SafeTabPanel index={7}>
              <Settings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export default withRouter(Profile);
