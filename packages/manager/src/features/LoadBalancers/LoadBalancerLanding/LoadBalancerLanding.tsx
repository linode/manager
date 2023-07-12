import React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader/LandingHeader';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';

const RouteLanding = React.lazy(
  () => import('../Routes/RouteLanding/RouteLanding')
);
const EntryPointLanding = React.lazy(
  () => import('../EntryPoints/EntryPointLanding/EntryPointLanding')
);

const LoadBalancerLanding = () => {
  const history = useHistory();
  const { tab } = useParams<{
    tab?: 'routes' | 'entrypoints';
  }>();

  const tabs = [
    {
      title: 'Load Balancers',
      routeName: `/loadbalancers`,
    },
    {
      title: 'Routes',
      routeName: `/loadbalancers/routes`,
    },
    {
      title: 'Service Targets',
      routeName: `/loadbalancers/entrypoints`,
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
      : tab === 'entrypoints'
      ? 'Create Service Target'
      : 'Create Load Balancer'
    : 'Create Load Balancer';

  const createButtonAction = () => {
    if (tab === 'routes') {
      history.push(`/loadbalancers/routes/create`);
    } else if (tab === 'entrypoints') {
      history.push(`/loadbalancers/entrypoints/create`);
    } else {
      history.push(`/loadbalancers/create`);
    }
  };

  return (
    <>
      <DocumentTitleSegment segment="Akamai Global Load Balancers" />
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
              <EntryPointLanding />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default LoadBalancerLanding;
