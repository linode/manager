import { NotFound } from '@linode/ui';
import { QueryClient } from '@tanstack/react-query';
import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { ErrorComponent } from 'src/features/ErrorBoundary/ErrorComponent';
// DISTRIBUTION: remove this import and iamRouteTree from routeTree.addChildren below.
import { iamRouteTree } from 'src/features/IAM/routes';

import { accountRouteTree } from './account';
import { accountSettingsRouteTree, settingsRouteTree } from './accountSettings';
import { cloudPulseAlertsRouteTree } from './alerts';
import { cancelLandingRoute, logoutRoute, oauthCallbackRoute } from './auth';
import { betaRouteTree } from './betas';
import { billingRouteTree } from './billing';
import { databasesRouteTree } from './databases';
import { deliveryRouteTree } from './delivery';
import { domainsRouteTree } from './domains';
import { eventsRouteTree } from './events';
import { firewallsRouteTree } from './firewalls';
import { imagesRouteTree } from './images';
import { inferencePlatformRouteTree } from './inferencePlatform';
import { kubernetesRouteTree } from './kubernetes';
import { linodesRouteTree } from './linodes';
import { loginHistoryRouteTree } from './loginHistory/';
import { longviewRouteTree } from './longview';
import { maintenanceRouteTree } from './maintenance';
import { managedRouteTree } from './managed';
import { marketplaceRouteTree } from './marketplace';
import { cloudPulseMetricsRouteTree } from './metrics';
import { natGatewaysRouteTree } from './natgateways';
import { networkLoadBalancersRouteTree } from './networkLoadBalancer';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { objectStorageRouteTree } from './objectStorage';
import { placementGroupsRouteTree } from './placementGroups';
import { profileRouteTree } from './profile';
import { quotasRouteTree } from './quotas';
import { reservedIpsRouteTree } from './reservedIps';
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
  logoutRoute,
  accountRouteTree,
  billingRouteTree,
  betaRouteTree,
  cloudPulseAlertsRouteTree,
  cloudPulseMetricsRouteTree,
  databasesRouteTree,
  deliveryRouteTree,
  domainsRouteTree,
  eventsRouteTree,
  iamRouteTree,
  firewallsRouteTree,
  imagesRouteTree,
  inferencePlatformRouteTree,
  kubernetesRouteTree,
  linodesRouteTree,
  loginHistoryRouteTree,
  longviewRouteTree,
  maintenanceRouteTree,
  managedRouteTree,
  marketplaceRouteTree,
  natGatewaysRouteTree,
  networkLoadBalancersRouteTree,
  nodeBalancersRouteTree,
  oauthCallbackRoute,
  objectStorageRouteTree,
  placementGroupsRouteTree,
  profileRouteTree,
  quotasRouteTree,
  reservedIpsRouteTree,
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
    isIAMEnabled: false,
    isPlacementGroupsEnabled: false,
    isPrivateImageSharingEnabled: false,
    profile: undefined,
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
  interface HistoryState {
    surveyLink?: string;
  }
}
