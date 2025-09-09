import { Outlet } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

export const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  // Default redirect to the display tab
  if (location.pathname === '/profile') {
    navigate({ to: '/profile/display' });
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile" />
      <LandingHeader removeCrumbX={1} title="My Profile" />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <React.Suspense fallback={<SuspenseLoader />}>
            <Outlet />
          </React.Suspense>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};
