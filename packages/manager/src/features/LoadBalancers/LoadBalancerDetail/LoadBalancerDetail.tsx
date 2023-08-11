// import { useLocation } from '@reach/router';
import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';

interface Props {
  location: Location;
}

const LoadBalancerDetailLanding = (props: Props) => {
  const { location } = props;

  const history = useHistory();
  const { loadbalancerId } = useParams<{
    loadbalancerId: string;
    tab?: 'activity' | 'entrypoints' | 'settings' | 'summary';
  }>();

  const id = Number(loadbalancerId);

  const tabs = [
    {
      routeName: `/loadbalancer/${id}`,
      title: 'Summary',
    },
    {
      routeName: `/loadbalancer/${id}/entrypoints`,
      title: 'Entry Points',
    },
    {
      routeName: `/loadbalancer/${id}/activity`,
      title: 'Activity Feed',
    },
    {
      routeName: `/loadbalancer/${id}/settings`,
      title: 'Settings',
    },
  ];

  const [index, setIndex] = React.useState(
    tabs.findIndex(
      (tab) =>
        Boolean(matchPath(tab.routeName, { path: location.pathname })) || 0
    )
  );

  const handleTabChange = (index: number) => {
    setIndex(index);
    history.push(tabs[index].routeName);
  };

  return (
    <>
      {/* TODO: AGLB - Use Load Balancer label */}
      <DocumentTitleSegment segment={loadbalancerId} />
      <ProductInformationBanner
        bannerLocation="LoadBalancers"
        important
        warning
      />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Load Balancer',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/loadbalancers/${id}`, // TODO: AGLB - Use Load Balancer label
        }}
        docsLabel="Docs"
        docsLink="" // TODO: AGLB - Add docs link
      />

      <Tabs index={index} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <>TODO: AGLB M3-6818: Load Balancer Details Summary </>
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <>TODO: AGLB M3-6819: Load Balancer Details Entry Points </>
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <>TODO: AGLB M3-6820: Load Balancer Details Activity Feed </>
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <>TODO: AGLB M3-6821: Load Balancer Details Settings </>
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default LoadBalancerDetailLanding;
