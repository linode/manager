import { useMatchRoute, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

const Destinations = React.lazy(() =>
  import('./Destinations/Destinations').then((module) => ({
    default: module.Destinations,
  }))
);

const Streams = React.lazy(() =>
  import('./Streams/Streams').then((module) => ({
    default: module.Streams,
  }))
);

export const DataStreamLanding = React.memo(() => {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream',
    },
    entity: 'DataStream',
    title: 'DataStream',
  };

  const tabs = [
    {
      routeName: '/datastream/streams',
      title: 'Streams',
    },
    {
      routeName: '/datastream/destinations',
      title: 'Destinations',
    },
  ];

  const getDefaultTabIndex = () => {
    const matchingTabIndex = tabs.findIndex((tab) =>
      Boolean(matchRoute({ to: tab.routeName }))
    );

    return matchingTabIndex >= 0 ? matchingTabIndex : 0;
  };

  const handleTabChange = (index: number) =>
    navigate({ to: tabs[index].routeName });

  return (
    <>
      <ProductInformationBanner bannerLocation="DataStream" />
      <DocumentTitleSegment segment="DataStream" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />

      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

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
