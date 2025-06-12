import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const SSHKeys = React.lazy(() =>
  import('./SSHKeys/SSHKeys').then((module) => ({
    default: module.SSHKeys,
  }))
);
const Settings = React.lazy(() =>
  import('./Settings/Settings').then((module) => ({
    default: module.ProfileSettings,
  }))
);
const Referrals = React.lazy(() =>
  import('./Referrals/Referrals').then((module) => ({
    default: module.Referrals,
  }))
);
const OAuthClients = React.lazy(() => import('./OAuthClients/OAuthClients'));
const LishSettings = React.lazy(() =>
  import('./LishSettings/LishSettings').then((module) => ({
    default: module.LishSettings,
  }))
);
const DisplaySettings = React.lazy(() =>
  import('./DisplaySettings/DisplaySettings').then((module) => ({
    default: module.DisplaySettings,
  }))
);
const AuthenticationSettings = React.lazy(() =>
  import('./AuthenticationSettings/AuthenticationSettings').then((module) => ({
    default: module.AuthenticationSettings,
  }))
);
const APITokens = React.lazy(() =>
  import('./APITokens/APITokens').then((module) => ({
    default: module.APITokens,
  }))
);

export const Profile = () => {
  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      to: `/profile/display`,
      title: 'Display',
    },
    {
      to: `/profile/auth`,
      title: 'Login & Authentication',
    },
    {
      to: `/profile/keys`,
      title: 'SSH Keys',
    },
    {
      to: `/profile/lish`,
      title: 'LISH Console Settings',
    },
    {
      to: `/profile/tokens`,
      title: 'API Tokens',
    },
    {
      to: `/profile/clients`,
      title: 'OAuth Apps',
    },
    {
      to: `/profile/referrals`,
      title: 'Referrals',
    },
    {
      to: `/profile/settings`,
      title: 'My Settings',
    },
  ]);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile" />
      <LandingHeader removeCrumbX={1} title="My Profile" />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <DisplaySettings />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <AuthenticationSettings />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <SSHKeys />
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <LishSettings />
            </SafeTabPanel>
            <SafeTabPanel index={4}>
              <APITokens />
            </SafeTabPanel>
            <SafeTabPanel index={5}>
              <OAuthClients />
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
