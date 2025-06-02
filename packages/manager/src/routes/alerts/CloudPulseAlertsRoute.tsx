import { NotFound, Paper } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

export const CloudPulseAlertsRoute = () => {
  const { isACLPEnabled } = useIsACLPEnabled();
  const flags = useFlags();

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: '/alerts/definitions',
      title: 'Definitions',
      disabled: !flags.aclpAlerting?.alertDefinitions,
    },
  ]);

  if (!isACLPEnabled) {
    return <NotFound />;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Alerts" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/alerts' }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/akamai-cloud-pulse"
        spacingBottom={4}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Paper>
                <Outlet />
              </Paper>
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Suspense>
  );
};
