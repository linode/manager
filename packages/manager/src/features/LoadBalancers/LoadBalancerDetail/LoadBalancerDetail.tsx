import * as React from 'react';
import {
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Tabs } from 'src/components/ReachTabs';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';

const LoadBalancerSummary = React.lazy(() =>
  import('./LoadBalancerSummary').then((module) => ({
    default: module.LoadBalancerSummary,
  }))
);

const LoadBalancerConfigurations = React.lazy(() =>
  import('./LoadBalancerConfigurations').then((module) => ({
    default: module.LoadBalancerConfigurations,
  }))
);

const LoadBalancerServiceTargets = React.lazy(() =>
  import('./LoadBalancerServiceTargets').then((module) => ({
    default: module.LoadBalancerServiceTargets,
  }))
);

const LoadBalancerCertificates = React.lazy(() =>
  import('./Certificates').then((module) => ({
    default: module.LoadBalancerCertificates,
  }))
);

const LoadBalancerSettings = React.lazy(() =>
  import('./LoadBalancerSettings').then((module) => ({
    default: module.LoadBalancerSettings,
  }))
);

const LoadBalancerDetailLanding = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const location = useLocation();
  const { path, url } = useRouteMatch();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);

  const tabs = [
    {
      component: LoadBalancerSummary,
      path: 'summary',
      title: 'Summary',
    },
    {
      component: LoadBalancerConfigurations,
      path: 'configurations',
      title: 'Configurations',
    },
    {
      component: undefined,
      path: 'routes',
      title: 'Routes',
    },
    {
      component: LoadBalancerServiceTargets,
      path: 'service-targets',
      title: 'Service Targets',
    },
    {
      component: LoadBalancerCertificates,
      path: 'certificates',
      title: 'Certificates',
    },
    {
      component: LoadBalancerSettings,
      path: 'settings',
      title: 'Settings',
    },
  ];

  const tabIndex = tabs.findIndex((tab) =>
    location.pathname.startsWith(`${url}/${tab.path}`)
  );

  return (
    <>
      <DocumentTitleSegment segment={loadbalancer?.label ?? ''} />
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
      <Tabs index={tabIndex === -1 ? 0 : tabIndex}>
        <TabLinkList
          tabs={tabs.map((t) => ({ ...t, routeName: `${url}/${t.path}` }))}
        />
        <React.Suspense fallback={<SuspenseLoader />}>
          <Switch>
            {tabs.map((tab) => (
              <Route
                component={tab.component}
                key={tab.title}
                path={`${path}/${tab.path}`}
              />
            ))}
            <Route component={LoadBalancerSummary} />
          </Switch>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default LoadBalancerDetailLanding;
