import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  matchPath,
  useHistory,
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
  const { path } = useRouteMatch();
  const history = useHistory();
  const tabs = [
    {
      accessible: flags.aclpAlerting?.alertDefinitions,
      routeName: `${path}/definitions`,
      title: 'Definitions',
    },
  ];
  const accessibleTabs = tabs.filter((tab) => tab.accessible);
  const location = useLocation();
  const navToURL = (index: number) => {
    history.push(accessibleTabs[index].routeName);
  };
  const matches = (p: string) => {
    return Boolean(matchPath(location.pathname, { exact: false, path: p }));
  };
  return (
    <Paper>
      <Tabs
        index={accessibleTabs.findIndex((tab) => matches(tab.routeName))}
        onChange={navToURL}
        style={{ width: '100%' }}
      >
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
