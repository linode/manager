import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import {
  accountBillingRoute,
  accountIndexRoute,
  accountLoginHistoryRoute,
  accountMaintenanceRoute,
  accountServiceTransfersRoute,
  accountSettingsRoute,
  accountUsersRoute,
} from 'src/features/Account/AccountLanding';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const AccountRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Account" />
      <Outlet />
    </React.Suspense>
  );
};

export const accountRoute = createRoute({
  component: AccountRoutes,
  getParentRoute: () => rootRoute,
  path: 'account',
});

const accountUsersUsernameRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Users/UserDetail'),
    'UserDetail'
  ),
  getParentRoute: () => accountRoute,
  path: 'users/$username',
});

const accountUsersUsernameProfileRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Users/UserProfile/UserProfile'),
    'UserProfile'
  ),
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'users/$username/profile',
});

const accountUsersUsernamePermissionsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Users/UserPermissions')
  ),
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'users/$username/permissions',
});

const accountInvoicesInvoiceIdRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Billing/InvoiceDetail/InvoiceDetail'),
    'InvoiceDetail'
  ),
  getParentRoute: () => accountRoute,
  parseParams: (params) => ({
    invoiceId: Number(params.invoiceId),
  }),
  path: 'billing/invoices/$invoiceId',
});

const accountEntityTransfersCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import(
        'src/features/EntityTransfers/EntityTransfersCreate/EntityTransfersCreate'
      ),
    'EntityTransfersCreate'
  ),
  getParentRoute: () => accountRoute,
  path: 'service-transfers/create',
});

export const accountRouteTree = accountRoute.addChildren([
  accountUsersUsernameRoute.addChildren([
    accountUsersUsernameProfileRoute,
    accountUsersUsernamePermissionsRoute,
  ]),
  accountIndexRoute.addChildren([
    accountBillingRoute,
    accountUsersRoute,
    accountLoginHistoryRoute,
    accountServiceTransfersRoute,
    accountMaintenanceRoute,
    accountSettingsRoute,
  ]),
  accountInvoicesInvoiceIdRoute,
  accountEntityTransfersCreateRoute,
]);
