import { NotFound } from '@linode/ui';
import { QueryClient } from '@tanstack/react-query';
import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { ErrorComponent } from 'src/features/ErrorBoundary/ErrorComponent';

import { accountRouteTree } from './account';
import { accountSettingsRouteTree, settingsRouteTree } from './accountSettings';
import { cloudPulseAlertsRouteTree } from './alerts';
import {
  cancelLandingRoute,
  loginAsCustomerCallbackRoute,
  logoutRoute,
  oauthCallbackRoute,
} from './auth';
import { betaRouteTree } from './betas';
import { billingRouteTree } from './billing';
import { databasesRouteTree } from './databases';
import { dataStreamRouteTree } from './datastream';
import { domainsRouteTree } from './domains';
import { eventsRouteTree } from './events';
import { firewallsRouteTree } from './firewalls';
import { iamRouteTree } from './IAM';
import { imagesRouteTree } from './images';
import { kubernetesRouteTree } from './kubernetes';
import { linodesRouteTree } from './linodes';
import { loginHistoryRouteTree } from './loginHistory/';
import { longviewRouteTree } from './longview';
import { maintenanceRouteTree } from './maintenance';
import { managedRouteTree } from './managed';
import { cloudPulseMetricsRouteTree } from './metrics';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { objectStorageRouteTree } from './objectStorage';
import { placementGroupsRouteTree } from './placementGroups';
import { profileRouteTree } from './profile';
import { quotasRouteTree } from './quotas';
import { rootRoute } from './root';
import { searchRouteTree } from './search';
import { serviceTransfersRouteTree } from './serviceTransfers';
import { stackScriptsRouteTree } from './stackscripts';
import { supportRouteTree } from './support';
import { usersAndGrantsRouteTree } from './usersAndGrants';
import { volumesRouteTree } from './volumes';
import { vpcsRouteTree } from './vpcs';

const indexRoute = createRoute({
  beforeLoad: ({ context }) => {
    const { accountSettings } = context;
    const defaultRoot = accountSettings?.managed ? '/managed' : '/linodes';
    throw redirect({ to: defaultRoot });
  },
  getParentRoute: () => rootRoute,
  path: '/',
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  accountSettingsRouteTree,
  cancelLandingRoute,
  loginAsCustomerCallbackRoute,
  logoutRoute,
  oauthCallbackRoute,
  accountRouteTree,
  billingRouteTree,
  betaRouteTree,
  cloudPulseAlertsRouteTree,
  cloudPulseMetricsRouteTree,
  databasesRouteTree,
  dataStreamRouteTree,
  domainsRouteTree,
  eventsRouteTree,
  iamRouteTree,
  firewallsRouteTree,
  imagesRouteTree,
  kubernetesRouteTree,
  linodesRouteTree,
  loginHistoryRouteTree,
  longviewRouteTree,
  maintenanceRouteTree,
  managedRouteTree,
  nodeBalancersRouteTree,
  objectStorageRouteTree,
  placementGroupsRouteTree,
  profileRouteTree,
  quotasRouteTree,
  searchRouteTree,
  serviceTransfersRouteTree,
  settingsRouteTree,
  stackScriptsRouteTree,
  supportRouteTree,
  usersAndGrantsRouteTree,
  volumesRouteTree,
  vpcsRouteTree,
]);

export const router = createRouter({
  context: {
    accountSettings: undefined,
    flags: {},
    globalErrors: {},
    isACLPEnabled: false,
    isDatabasesEnabled: false,
    isPlacementGroupsEnabled: false,
    queryClient: new QueryClient(),
  },
  defaultNotFoundComponent: () => <NotFound />,
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorComponent error={error} eventId={error.name} resetError={reset} />
  ),
  defaultPreload: 'intent',
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    // This infers the type of our router and registers it across the entire project
    router: typeof router;
  }
}
