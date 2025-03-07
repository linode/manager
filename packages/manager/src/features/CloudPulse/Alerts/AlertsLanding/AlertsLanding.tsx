import { Box, Paper } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';

import { AlertDefinitionLanding } from './AlertsDefinitionLanding';

import type { Tab } from 'src/components/Tabs/TabLinkList';

export type EnabledAlertTab = {
  isEnabled: boolean;
  tab: Tab;
};

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
    <React.Suspense fallback={<SuspenseLoader />}>
      <LandingHeader
        breadcrumbProps={{ pathname: '/alerts' }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/akamai-cloud-pulse"
      />
      <Tabs
        index={activeTabIndex}
        onChange={handleChange}
        sx={{ width: '100%' }}
      >
        <TabLinkList tabs={accessibleTabs} />
        <Paper sx={{ padding: 2 }}>
          <Box
            sx={{
              aligneItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              p: 1,
              width: '100%',
            }}
          />
          <Switch>
            <Route
              component={AlertDefinitionLanding}
              path={'/alerts/definitions'}
            />
            <Redirect from="*" to="/alerts/definitions" />
          </Switch>
        </Paper>
      </Tabs>
    </React.Suspense>
  );
});

export const cloudPulseAlertsLandingLazyRoute = createLazyRoute('/alerts')({
  component: AlertsLanding,
});
