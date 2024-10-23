import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import { AlertDefinitionLanding } from './AlertsDefinitionLanding';

import type { EnabledAlertTab } from '../../CloudPulseTabs';

export const AlertsLanding = React.memo(() => {
  const flags = useFlags();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const history = useHistory();
  const alertTabs = React.useMemo<EnabledAlertTab[]>(
    () => [
      {
        isEnabled: Boolean(flags.aclpAlerting?.alertDefinitions),
        tab: { routeName: `${url}/definitions`, title: 'Definitions' },
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
    <Paper sx={{ padding: 2 }}>
      <Tabs
        index={activeTabIndex}
        onChange={handleChange}
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
          {pathname === `${url}/definitions` && (
            <Box>
              <Button
                onClick={(_) => {
                  history.push(`${url}/definitions/create`);
                }}
                buttonType="primary"
                variant="contained"
              >
                Create
              </Button>
            </Box>
          )}
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
