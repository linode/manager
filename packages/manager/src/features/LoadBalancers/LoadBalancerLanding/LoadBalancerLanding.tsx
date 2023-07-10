import React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader/LandingHeader';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';

const RouteLanding = React.lazy(() =>
  import('../Routes/RouteLanding/RouteLanding').then((module) => ({
    default: module.RouteLanding,
  }))
);
const EntryPointLanding = React.lazy(() =>
  import('../EntryPoints/EntryPointLanding/EntryPointLanding').then(
    (module) => ({
      default: module.EntryPointLanding,
    })
  )
);

const LoadBalancerLanding = () => {
  const history = useHistory();
  const { tab } = useParams<{
    //action?: 'create'; // TODO: AGLB
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

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );
    if (tabChoice < 0) {
      // Redirect to the landing page if the path does not exist
      return 0;
    } else {
      return tabChoice;
    }
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  // TODO: debug and cleanup
  // const createButtonText =
  //   tab === 'routes'
  //     ? 'Create Route'
  //     : 'entry-points'
  //     ? 'Create Service Target'
  //     : 'Create Load Balancer';

  const createButtonText = () => {
    const tabChoice = location.pathname.substring(
      location.pathname.lastIndexOf('/') + 1
    );
    let buttonText = 'Create ';

    switch (tabChoice) {
      case 'routes':
        buttonText += 'Route';
        break;
      case 'entrypoints':
        buttonText += 'Service Target';
        break;
      default:
        buttonText += 'Load Balancer';
    }

    return buttonText;
  };

  const createButtonAction = () => {
    if (tab === 'loadbalancers') {
      history.replace(`/loadbalancers/create`);
    } else if (tab === 'routes') {
      history.replace(`/loadbalancers/routes/create`);
    } else if (tab === 'entrypoints') {
      history.replace(`/loadbalancers/entrypoints/create`);
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
        onButtonClick={createButtonAction} // TODO: AGLB
        removeCrumbX={1}
        title="Akamai Global Load Balancers"
      />
      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
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
