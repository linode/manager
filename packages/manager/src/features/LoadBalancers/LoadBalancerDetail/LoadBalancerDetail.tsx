import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';

const LoadBalancerSummary = React.lazy(() =>
  import('./LoadBalancerSummary').then((module) => ({
    default: module.LoadBalancerSummary,
  }))
);

const LoadBalancerDetailLanding = () => {
  const history = useHistory();

  const { loadbalancerId, tab } = useParams<{
    loadbalancerId: string;
    tab?: string;
  }>();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);

  const tabs = [
    {
      routeName: `/loadbalancers/${id}/summary`,
      title: 'Summary',
    },
    {
      routeName: `/loadbalancers/${id}/configurations`,
      title: 'Configrations',
    },
    {
      routeName: `/loadbalancers/${id}/routes`,
      title: 'Routes',
    },
    {
      routeName: `/loadbalancers/${id}/service-targets`,
      title: 'Service Targets',
    },
    {
      routeName: `/loadbalancers/${id}/certificates`,
      title: 'Certificates',
    },
    {
      routeName: `/loadbalancers/${id}/settings`,
      title: 'Settings',
    },
  ];

  const tabIndex = tab ? tabs.findIndex((t) => t.routeName.endsWith(tab)) : 0;

  return (
    <>
      <DocumentTitleSegment segment={loadbalancerId} />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/loadbalancers/${loadbalancer?.label}`,
        }}
        docsLabel="Docs"
        docsLink="" // TODO: AGLB - Add docs link
      />
      <Tabs index={tabIndex} onChange={(i) => history.push(tabs[i].routeName)}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <React.Suspense fallback={<SuspenseLoader />}>
              <LoadBalancerSummary />
            </React.Suspense>
          </SafeTabPanel>
          <SafeTabPanel index={1}>1</SafeTabPanel>
          <SafeTabPanel index={2}>2</SafeTabPanel>
          <SafeTabPanel index={3}>3</SafeTabPanel>
          <SafeTabPanel index={4}>4</SafeTabPanel>
          <SafeTabPanel index={5}>5</SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default LoadBalancerDetailLanding;
