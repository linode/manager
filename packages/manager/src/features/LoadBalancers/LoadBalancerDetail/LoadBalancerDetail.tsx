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
const LoadBalancerRoutes = React.lazy(() =>
  import('./LoadBalancerRoutes').then((module) => ({
    default: module.LoadBalancerRoutes,
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

export const LoadBalancerDetail = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const location = useLocation();
  const { path, url } = useRouteMatch();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);

  const tabs = [
    {
      path: 'summary',
      title: 'Summary',
    },
    {
      path: 'configurations',
      title: 'Configurations',
    },
    {
      path: 'routes',
      title: 'Routes',
    },
    {
      path: 'service-targets',
      title: 'Service Targets',
    },
    {
      path: 'certificates',
      title: 'Certificates',
    },
    {
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
        feedbackLink="https://docs.google.com/forms/d/e/1FAIpQLSdfetx9VvwjUAC_gdGQai_FpZN4xZ1GZGW54abezS2aV5rCcQ/viewform"
        feedbackLinkLabel="BETA Feedback"
        shouldHideDocsAndCreateButtons={true} // TODO: AGLB - should be removed when docs link is provided.
      />
      <Tabs index={tabIndex === -1 ? 0 : tabIndex}>
        <TabLinkList
          tabs={tabs.map((t) => ({ ...t, routeName: `${url}/${t.path}` }))}
        />
        <React.Suspense fallback={<SuspenseLoader />}>
          <Switch>
            <Route
              component={LoadBalancerConfigurations}
              path={`${path}/configurations/:configurationId?`}
            />
            <Route component={LoadBalancerRoutes} path={`${path}/routes`} />
            <Route
              component={LoadBalancerCertificates}
              path={`${path}/certificates`}
            />
            <Route
              component={LoadBalancerServiceTargets}
              path={`${path}/service-targets`}
            />
            <Route component={LoadBalancerSettings} path={`${path}/settings`} />
            <Route component={LoadBalancerSummary} />
          </Switch>
        </React.Suspense>
      </Tabs>
    </>
  );
};
