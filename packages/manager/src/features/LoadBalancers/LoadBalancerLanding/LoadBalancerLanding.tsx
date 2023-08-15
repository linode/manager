import React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';

const RouteLanding = React.lazy(
  () => import('../Routes/RouteLanding/RouteLanding')
);
const ServiceTargetLanding = React.lazy(
  () => import('../ServiceTargets/ServiceTargetLanding/ServiceTargetLanding')
);

const LoadBalancerLanding = () => {
  const history = useHistory();
  const { tab } = useParams<{
    tab?: 'routes' | 'service-targets';
  }>();

  const tabs = [
    {
      routeName: `/loadbalancers`,
      title: 'Load Balancers',
    },
    {
      routeName: `/loadbalancers/routes`,
      title: 'Routes',
    },
    {
      routeName: `/loadbalancers/service-targets`,
      title: 'Service Targets',
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

  const createButtonText = tab
    ? tab === 'routes'
      ? 'Create Route'
      : tab === 'service-targets'
      ? 'Create Service Target'
      : 'Create Load Balancer'
    : 'Create Load Balancer';

  const createButtonAction = () => {
    if (tab === 'routes') {
      history.push(`/loadbalancers/routes/create`);
    } else if (tab === 'service-targets') {
      history.push(`/loadbalancers/service-targets/create`);
    } else {
      history.push(`/loadbalancers/create`);
    }
  };

  return (
    <>
      <DocumentTitleSegment segment="Akamai Global Load Balancers" />
      <ProductInformationBanner bannerLocation="LoadBalancers" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/loadbalancers' }}
        createButtonText={createButtonText}
        docsLabel="Docs"
        docsLink="" // TODO: AGLB -  Add docs link
        entity="Akamai Global Load Balancers"
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        title="Akamai Global Load Balancers"
      />
      <Tabs index={index} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <>TODO: AGLB M3-6807: Load Balancer Landing </>
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <RouteLanding />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <ServiceTargetLanding />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default LoadBalancerLanding;
