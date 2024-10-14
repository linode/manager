import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import { AlertsLanding } from './Alerts/AlertsLanding/AlertsLanding';
import { CloudPulseDashboardLanding } from './Dashboard/CloudPulseDashboardLanding';

export const CloudPulseTabs = () => {
  const flags = useFlags();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const tabs = React.useMemo(
    () => [
      {
        accessible: true,
        routeName: `${url}/dashboards`,
        title: 'Dashboards',
      },
      {
        accessible:
          flags.aclpAlerting?.alertDefinitions ||
          flags.aclpAlerting?.recentActivity ||
          flags.aclpAlerting?.notificationChannels,
        routeName: `${url}/alerts`,
        title: 'Alerts',
      },
    ],
    [url, flags.aclpAlerting]
  );
  const accessibleTabs = tabs.filter((tab) => tab.accessible);
  const activeTabIndex = React.useMemo(
    () =>
      Math.max(
        accessibleTabs.findIndex((tab) => pathname.startsWith(tab.routeName)),
        0
      ),
    [accessibleTabs, pathname]
  );
  return (
    <Tabs index={activeTabIndex} marginTop={0}>
      <TabLinkList tabs={accessibleTabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route
            component={CloudPulseDashboardLanding}
            path={`${url}/dashboards`}
          />
          <Route component={AlertsLanding} path={`${url}/alerts`} />
          <Redirect
            exact
            from="/monitor/cloudpulse"
            to="/monitor/cloudpulse/dashboards"
          />
        </Switch>
      </React.Suspense>
    </Tabs>
  );
};
