import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import { AlertsLanding } from './Alerts/AlertsLanding/AlertsLanding';
import { CloudPulseDashboardLanding } from './Dashboard/CloudPulseDashboardLanding';

import type { Tab } from 'src/components/Tabs/TabLinkList';

export type EnabledAlertTab = {
  isEnabled: boolean;
  tab: Tab;
};
export const CloudPulseTabs = () => {
  const flags = useFlags();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const history = useHistory();
  const alertTabs = React.useMemo<EnabledAlertTab[]>(
    () => [
      {
        isEnabled: true,
        tab: {
          routeName: `${url}/dashboards`,
          title: 'Dashboards',
        },
      },
      {
        isEnabled: Boolean(
          flags.aclpAlerting?.alertDefinitions ||
            flags.aclpAlerting?.recentActivity ||
            flags.aclpAlerting?.notificationChannels
        ),
        tab: {
          routeName: `${url}/alerts`,
          title: 'Alerts',
        },
      },
    ],
    [url, flags.aclpAlerting]
  );
  const accessibleTabs = React.useMemo(
    () =>
      alertTabs
        .filter((alertTab) => alertTab.isEnabled)
        .map((alertTab) => alertTab.tab),
    [alertTabs]
  );
  const activeTabIndex = React.useMemo(
    () =>
      Math.max(
        accessibleTabs.findIndex((tab) => pathname.startsWith(tab.routeName)),
        0
      ),
    [accessibleTabs, pathname]
  );
  const handleChange = (index: number) => {
    history.push(alertTabs[index].tab.routeName);
  };
  return (
    <Tabs index={activeTabIndex} margintop={0} onChange={handleChange}>
      <TabLinkList tabs={accessibleTabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route
            component={CloudPulseDashboardLanding}
            exact
            path={`${url}/dashboards`}
          />
          <Route component={AlertsLanding} path={`${url}/alerts`} />
          <Redirect from="*" to="/monitor/dashboards" />
        </Switch>
      </React.Suspense>
    </Tabs>
  );
};
