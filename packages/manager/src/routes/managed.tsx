import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const ManagedRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Managed" />
      <Outlet />
    </React.Suspense>
  );
};

export const managedRoute = createRoute({
  component: ManagedRoutes,
  getParentRoute: () => rootRoute,
  path: 'managed',
});

export const managedIndexRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Managed/ManagedDashboardCard/ManagedDashboardCard').then(
    (m) => m.managedDashboardCardLazyRoute
  )
);

export const managedSummaryRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'summary',
}).lazy(() =>
  import('src/features/Managed/ManagedDashboardCard/ManagedDashboardCard').then(
    (m) => m.managedDashboardCardLazyRoute
  )
);

export const managedMonitorsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'monitors',
}).lazy(() =>
  import('src/features/Managed/Monitors/MonitorTable').then(
    (m) => m.managedMonitorTableLazyRoute
  )
);

export const managedSSHAccessRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'ssh-access',
}).lazy(() =>
  import('src/features/Managed/SSHAccess/SSHAccess').then(
    (m) => m.managedSSHAccessLazyRoute
  )
);

export const managedCredentialsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'credentials',
}).lazy(() =>
  import('src/features/Managed/Credentials/CredentialList').then(
    (m) => m.managedCredentialsLazyRoute
  )
);

export const managedContactsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'contacts',
}).lazy(() =>
  import('src/features/Managed/Contacts/Contacts').then(
    (m) => m.managedContactsLazyRoute
  )
);

export const managedRouteTree = managedRoute.addChildren([
  managedIndexRoute,
  managedSummaryRoute,
  managedMonitorsRoute,
  managedSSHAccessRoute,
  managedCredentialsRoute,
  managedContactsRoute,
]);
