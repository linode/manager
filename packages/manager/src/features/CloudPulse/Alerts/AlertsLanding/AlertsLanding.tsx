import { Paper } from '@linode/ui';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { AlertListing } from '../AlertsListing/AlertListing';

import type { Tab } from 'src/components/Tabs/TabLinkList';

export type EnabledAlertTab = {
  isEnabled: boolean;
  tab: Tab;
};

export const AlertsLanding = React.memo(() => {
  const flags = useFlags();

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: '/alerts/definitions',
      title: 'Definitions',
      disabled: !flags.aclpAlerting?.alertDefinitions,
    },
  ]);

  return (
    <Tabs index={tabIndex} onChange={handleTabChange}>
      <TanStackTabLinkList tabs={tabs} />
      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          <SafeTabPanel index={0}>
            <Paper>
              <AlertListing />
            </Paper>
          </SafeTabPanel>
        </TabPanels>
      </React.Suspense>
    </Tabs>
  );
});
