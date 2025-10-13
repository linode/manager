import { TabPanels } from '@reach/tabs';
import { Outlet } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

export const DefaultsLanding = () => {
  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/roles/defaults/roles`,
      title: 'Default Roles',
    },
    {
      to: `/iam/roles/defaults/entity-access`,
      title: 'Default Entity Access',
    },
  ]);

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: '/iam/roles/defaults',
        }}
        title="Default Roles for Delegate Users"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <Outlet />
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};
