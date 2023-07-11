// import { useLocation } from '@reach/router';
import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';

interface Props {
  location: Location;
}

const LoadBalancerDetailLanding = (props: Props) => {
  const { location } = props;

  const history = useHistory();
  const { loadbalancerId } = useParams<{
    loadbalancerId: string;
    tab?: 'summary' | 'entrypoints' | 'activity' | 'settings';
  }>();

  const id = Number(loadbalancerId);

  const tabs = [
    {
      title: 'Summary',
      routeName: `loadbalancer/${id}`,
    },
    {
      title: 'Entry Points',
      routeName: `loadbalancer/${id}/entrypoints`,
    },
    {
      title: 'Activity Feed',
      routeName: `loadbalancer/${id}/activity`,
    },
    {
      title: 'Settings',
      routeName: `loadbalancer/${id}/settings`,
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
      <LandingHeader
        breadcrumbProps={{
          pathname: `/loadbalancers/${id}`, // TODO: AGLB - Use Load Balancer label
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              position: 1,
              label: 'Load Balancer',
            },
          ],
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
