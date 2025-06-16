import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const WafOverview = React.lazy(() =>
  import('./WafOverview/WafOverview').then((module) => ({
    default: module.WafOverview,
  }))
);

const WafAnalytics = React.lazy(() =>
  import('./WafAnalytics/WafAnalytics').then((module) => ({
    default: module.WafAnalytics,
  }))
);

const WafLogs = React.lazy(() =>
  import('./WafLogs/WafLogs').then((module) => ({
    default: module.WafLogs,
  }))
);

const WafSettings = React.lazy(() =>
  import('./WafSettings/WafSettings').then((module) => ({
    default: module.WafSettings,
  }))
);

export const WafDetail = () => {
  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Overview',
      to: '/waf/$id/overview',
    },
    {
      title: 'Analytics',
      to: '/waf/$id/analytics',
    },
    {
      title: 'Logs',
      to: '/waf/$id/logs',
    },
    {
      title: 'Settings',
      to: '/waf/$id/settings',
    },
  ]);

  return (
    <React.Fragment>
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs}></TanStackTabLinkList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <WafOverview></WafOverview>
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <WafAnalytics></WafAnalytics>
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <WafLogs></WafLogs>
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <WafSettings></WafSettings>
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};
