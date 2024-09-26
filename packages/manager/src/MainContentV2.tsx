import { RouterProvider, createRoute } from '@tanstack/react-router';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import { useFlags } from 'src/hooks/useFlags';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { useAccountSettings } from './queries/account/settings';
import { router } from './routes';
import { rootRoute } from './routes/root';

const Longview = React.lazy(() => import('src/features/Longview'));
const Managed = React.lazy(() => import('src/features/Managed/ManagedLanding'));
const Help = React.lazy(() =>
  import('./features/Help/index').then((module) => ({
    default: module.HelpAndSupport,
  }))
);
const SearchLanding = React.lazy(
  () => import('src/features/Search/SearchLanding')
);
const EventsLanding = React.lazy(() =>
  import('src/features/Events/EventsLanding').then((module) => ({
    default: module.EventsLanding,
  }))
);
const AccountActivationLanding = React.lazy(
  () => import('src/components/AccountActivation/AccountActivationLanding')
);
const Firewalls = React.lazy(() => import('src/features/Firewalls'));
const Databases = React.lazy(() => import('src/features/Databases'));
const BetaRoutes = React.lazy(() => import('src/features/Betas'));
const VPC = React.lazy(() => import('src/features/VPCs'));

const CloudPulse = React.lazy(() =>
  import('src/features/CloudPulse/CloudPulseLanding').then((module) => ({
    default: module.CloudPulseLanding,
  }))
);

const managedRoute = createRoute({
  component: Managed,
  getParentRoute: () => rootRoute,
  path: 'managed',
});

const longviewRoute = createRoute({
  component: Longview,
  getParentRoute: () => rootRoute,
  path: 'longview',
});

const supportRoute = createRoute({
  component: Help,
  getParentRoute: () => rootRoute,
  path: 'support',
});

const searchRoute = createRoute({
  component: SearchLanding,
  getParentRoute: () => rootRoute,
  path: 'search',
});

const eventsRoute = createRoute({
  component: EventsLanding,
  getParentRoute: () => rootRoute,
  path: 'events',
});

const firewallsRoute = createRoute({
  component: Firewalls,
  getParentRoute: () => rootRoute,
  path: 'firewalls',
});

const databasesRoute = createRoute({
  component: Databases,
  getParentRoute: () => rootRoute,
  path: 'databases',
});

const betaRoute = createRoute({
  component: BetaRoutes,
  getParentRoute: () => rootRoute,
  path: 'betas',
});

const vpcRoute = createRoute({
  component: VPC,
  getParentRoute: () => rootRoute,
  path: 'vpcs',
});

const cloudPulseRoute = createRoute({
  component: CloudPulse,
  getParentRoute: () => rootRoute,
  path: 'monitor/cloudpulse',
});

const accountActivationRoute = createRoute({
  component: AccountActivationLanding,
  getParentRoute: () => rootRoute,
  path: 'account-activation',
});

const notFoundRoute = createRoute({
  component: NotFound,
  getParentRoute: () => rootRoute,
  path: '*',
});

// Create the route tree
// TODO: TanStackRouter - continue exporting this
// @ts-expect-error - TODO: Fix this type error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routeTree = rootRoute.addChildren([
  managedRoute,
  longviewRoute,
  supportRoute,
  searchRoute,
  eventsRoute,
  firewallsRoute,
  databasesRoute,
  betaRoute,
  vpcRoute,
  cloudPulseRoute,
  accountActivationRoute,
  notFoundRoute,
]);

export const MainContentV2 = () => {
  const { data: accountSettings } = useAccountSettings();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();
  const flags = useFlags();

  // Update the router's context
  router.update({
    context: {
      accountSettings,
      isACLPEnabled,
      isDatabasesEnabled,
      isPlacementGroupsEnabled,
      selfServeBetas: flags.selfServeBetas,
    },
  });

  return <RouterProvider router={router} />;
};
