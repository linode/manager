import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Redirect, Route, Switch, matchPath } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
// import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
// import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import AlertsLanding from './Alerts/AlertLanding/AlertsLanding';
import { CloudPulseDashboardLanding } from './Dashboard/CloudPulseDashboardLanding';

import type { RouteComponentProps } from 'react-router-dom';
type Props = RouteComponentProps<{}>;

export const CloudPulseTabs = React.memo((props: Props) => {
  const tabs = [
    {
      routeName: `${props.match.url}/dashboards`,
      title: 'Dashboards',
    },
    {
      routeName: `${props.match.url}/alerts`,
      title: 'Alerts',
    },
  ];

  const matches = (p: string) => {
    return Boolean(
      matchPath(props.location.pathname, { exact: false, path: p })
    );
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <StyledTabs
      index={Math.max(
        tabs.findIndex((tab) => matches(tab.routeName)),
        0
      )}
      onChange={navToURL}
    >
      <TabLinkList tabs={tabs} />

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
