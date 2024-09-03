import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Redirect, Route, Switch, matchPath } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
// import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
// import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import AlertsLanding from './Alerts/AlertLanding/AlertsLanding';
import { CloudPulseDashboardLanding } from './Dashboard/CloudPulseDashboardLanding';

import type { RouteComponentProps } from 'react-router-dom';
type Props = RouteComponentProps<{}>;

export const CloudPulseTabs = React.memo((props: Props) => {
  const flags = useFlags();
  const tabs = [
    {
      accessibile: true,
      routeName: `${props.match.url}/dashboards`,
      title: 'Dashboards',
    },
    {
      accessibile:
        flags.aclpAlerting?.alertDefinitions ||
        flags.aclpAlerting?.recentActivity ||
        flags.aclpAlerting?.notificationChannels,
      routeName: `${props.match.url}/alerts`,
      title: 'Alerts',
    },
  ];

  const accessibleTabs = tabs.filter((tab) => tab.accessibile);
  const matches = (p: string) => {
    return Boolean(
      matchPath(props.location.pathname, { exact: false, path: p })
    );
  };

  const navToURL = (index: number) => {
    props.history.push(accessibleTabs[index].routeName);
  };

  return (
    <StyledTabs
      index={Math.max(
        accessibleTabs.findIndex((tab) => matches(tab.routeName)),
        0
      )}
      onChange={navToURL}
    >
      <TabLinkList tabs={accessibleTabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route
            component={CloudPulseDashboardLanding}
            path={`${props.match.url}/dashboards`}
          />
          <Route component={AlertsLanding} path={`${props.match.url}/alerts`} />
          <Redirect
            exact
            from="/monitor/cloudpulse"
            to="/monitor/cloudpulse/dashboards"
          />
        </Switch>
        {/* <TabPanels>
          <SafeTabPanel index={0}>
            <CloudPulseDashboardLanding />
          </SafeTabPanel>
        </TabPanels> */}
      </React.Suspense>
    </StyledTabs>
  );
});

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  marginTop: 0,
}));
