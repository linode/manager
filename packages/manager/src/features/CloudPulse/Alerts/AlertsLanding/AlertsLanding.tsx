import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Paper } from 'src/components/Paper';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import { AlertDefinitionLanding } from './AlertsDefinitionLanding';

export const AlertsLanding = React.memo(() => {
  const flags = useFlags();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const tabs = React.useMemo(
    () => [
      {
        accessible: flags.aclpAlerting?.alertDefinitions,
        routeName: `${url}/definitions`,
        title: 'Definitions',
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
    <Paper sx={{ padding: 2 }}>
      <Tabs index={activeTabIndex} style={{ width: '100%' }}>
        <Box
          sx={{
            aligneItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            width: '100%',
          }}
        >
          <TabLinkList tabs={accessibleTabs} />
        </Box>
        <Switch>
          <Route
            component={AlertDefinitionLanding}
            path={'/monitor/cloudpulse/alerts/definitions'}
          />
          <Redirect
            from="/monitor/cloudpulse/alerts"
            to="/monitor/cloudpulse/alerts/definitions"
          />
        </Switch>
      </Tabs>
    </Paper>
  );
});
