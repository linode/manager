import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const Destinations = React.lazy(() =>
  import('./Destinations/DestinationsLanding').then((module) => ({
    default: module.DestinationsLanding,
  }))
);

const Streams = React.lazy(() =>
  import('./Streams/StreamsLanding').then((module) => ({
    default: module.StreamsLanding,
  }))
);

export const DeliveryLanding = React.memo(() => {
  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery',
    },
    removeCrumbX: 1,
    entity: 'Delivery',
    title: 'Delivery',
  };

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      to: '/logs/delivery/streams',
      title: 'Streams',
    },
    {
      to: '/logs/delivery/destinations',
      title: 'Destinations',
    },
  ]);

  return (
    <>
      <ProductInformationBanner bannerLocation="Delivery" />
      <DocumentTitleSegment segment="Delivery" />
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
