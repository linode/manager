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

const Domains = React.lazy(() =>
  import('src/features/Domains').then((module) => ({
    default: module.DomainsRoutes,
  }))
);
const Images = React.lazy(() => import('src/features/Images'));
const Kubernetes = React.lazy(() =>
  import('src/features/Kubernetes').then((module) => ({
    default: module.Kubernetes,
  }))
);
const ObjectStorage = React.lazy(() => import('src/features/ObjectStorage'));
const Profile = React.lazy(() =>
  import('src/features/Profile/Profile').then((module) => ({
    default: module.Profile,
  }))
);
const NodeBalancers = React.lazy(
  () => import('src/features/NodeBalancers/NodeBalancers')
);
const StackScripts = React.lazy(
  () => import('src/features/StackScripts/StackScripts')
);
const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);
const SupportTicketDetail = React.lazy(() =>
  import('src/features/Support/SupportTicketDetail/SupportTicketDetail').then(
    (module) => ({
      default: module.SupportTicketDetail,
    })
  )
);
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

const nodeBalancersRoute = createRoute({
  component: NodeBalancers,
  getParentRoute: () => rootRoute,
  path: 'nodebalancers',
});

const domainsRoute = createRoute({
  component: Domains,
  getParentRoute: () => rootRoute,
  path: 'domains',
});

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

const imagesRoute = createRoute({
  component: Images,
  getParentRoute: () => rootRoute,
  path: 'images',
});

const stackScriptsRoute = createRoute({
  component: StackScripts,
  getParentRoute: () => rootRoute,
  path: 'stackscripts',
});

const objectStorageRoute = createRoute({
  component: ObjectStorage,
  getParentRoute: () => rootRoute,
  path: 'object-storage',
});

const kubernetesRoute = createRoute({
  component: Kubernetes,
  getParentRoute: () => rootRoute,
  path: 'kubernetes',
});

const profileRoute = createRoute({
  component: Profile,
  getParentRoute: () => rootRoute,
  path: 'profile',
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

const supportTicketDetailRoute = createRoute({
  component: SupportTicketDetail,
  getParentRoute: () => rootRoute,
  path: 'support/tickets/:id',
});

const supportTicketsRoute = createRoute({
  component: SupportTickets,
  getParentRoute: () => rootRoute,
  path: 'support/tickets/create',
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
  nodeBalancersRoute,
  domainsRoute,
  managedRoute,
  longviewRoute,
  imagesRoute,
  stackScriptsRoute,
  objectStorageRoute,
  kubernetesRoute,
  profileRoute,
  supportRoute,
  searchRoute,
  eventsRoute,
  firewallsRoute,
  databasesRoute,
  betaRoute,
  vpcRoute,
  cloudPulseRoute,
  accountActivationRoute,
  supportTicketsRoute,
  supportTicketDetailRoute,
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
