import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
    tab?: 'loadbalancers' | 'routes' | 'entrypoints';
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

  const realTabs = ['loadbalancers', 'routes', 'entrypoints'];

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const createButtonText = () => {
    let buttonText = 'Create ';

    if (tab === 'routes') {
      buttonText += 'Route';
    } else if (tab === 'entrypoints') {
      buttonText += 'Service Target';
    } else {
      buttonText += 'Load Balancer';
    }
    return buttonText;
  };

  const createButtonAction = () => {
    if (tab === 'loadbalancers') {
      history.push(`/loadbalancers/create`);
    } else if (tab === 'routes') {
      history.push(`/loadbalancers/routes/create`);
    } else if (tab === 'entrypoints') {
      history.push(`/loadbalancers/entrypoints/create`);
    }
  };

  return (
    <>
      <DocumentTitleSegment segment="Akamai Global Load Balancers" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/loadbalancers' }}
        createButtonText={createButtonText()}
        docsLink="" // TODO: AGLB
        entity="Akamai Global Load Balancers"
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        title="Akamai Global Load Balancers"
      />
      <Tabs
        index={
          realTabs.findIndex((t) => t === tab) !== -1
            ? realTabs.findIndex((t) => t === tab)
            : 0
        }
        onChange={handleTabChange}
      >
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
