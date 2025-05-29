import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const Destinations = React.lazy(() =>
  import('./Destinations/Destinations').then((module) => ({
    default: module.Destinations,
  }))
);

const Streams = React.lazy(() =>
  import('./Streams/StreamsLanding').then((module) => ({
    default: module.StreamsLanding,
  }))
);

export const DataStreamLanding = React.memo(() => {
  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream',
    },
    entity: 'DataStream',
    title: 'DataStream',
  };

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      to: '/datastream/streams',
      title: 'Streams',
    },
    {
      to: '/datastream/destinations',
      title: 'Destinations',
    },
  ]);

  return (
    <>
      <ProductInformationBanner bannerLocation="DataStream" />
      <DocumentTitleSegment segment="DataStream" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Streams />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <Destinations />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});
