import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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

export const managedSummaryRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Managed/ManagedDashboardCard')
  ),
  getParentRoute: () => managedRoute,
  path: '/summary',
});

export const managedMonitorsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Managed/Monitors')
  ),
  getParentRoute: () => managedRoute,
  path: '/monitors',
});

export const managedSSHAccessRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Managed/SSHAccess')
  ),
  getParentRoute: () => managedRoute,
  path: '/ssh-access',
});

export const managedCredentialsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Managed/Credentials/CredentialList')
  ),
  getParentRoute: () => managedRoute,
  path: '/credentials',
});

export const managedContactsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Managed/Contacts/Contacts')
  ),
  getParentRoute: () => managedRoute,
  path: '/contacts',
});

export const managedRouteTree = managedRoute.addChildren([
  managedSummaryRoute,
  managedMonitorsRoute,
  managedSSHAccessRoute,
  managedCredentialsRoute,
  managedContactsRoute,
]);
