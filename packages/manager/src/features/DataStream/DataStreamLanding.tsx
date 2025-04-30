import * as React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';

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
  const history = useHistory();
  const location = useLocation();

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream',
    },
    entity: 'DataStream',
    title: 'DataStream',
  };

  const tabs = [
    {
      routeName: `/datastream/streams`,
      title: 'Streams',
    },
    {
      routeName: `/datastream/destinations`,
      title: 'Destinations',
    },
  ];

  const getDefaultTabIndex = () => {
    return (
      tabs.findIndex((tab) =>
        Boolean(matchPath(tab.routeName, { path: location.pathname }))
      ) || 0
    );
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  let idx = 0;

  return (
    <>
      <ProductInformationBanner bannerLocation="DataStream" />
      <DocumentTitleSegment segment="DataStream" />
      <LandingHeader {...landingHeaderProps} />

      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Streams />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Destinations />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default DataStreamLanding;
