import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

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

const accountRoute = createRoute({
  component: AccountRoutes,
  getParentRoute: () => rootRoute,
  path: 'account',
});

const accountIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: '/',
});

const accountUsersUsernameRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Users/UserDetail'),
    'UserDetail'
  ),
  getParentRoute: () => accountRoute,
  path: 'users/$username',
});

const accountBillingRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing',
});

const accountBillingEditRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing/edit',
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
  accountIndexRoute,
  accountUsersUsernameRoute,
  accountBillingRoute,
  accountBillingEditRoute,
  accountInvoicesInvoiceIdRoute,
  accountEntityTransfersCreateRoute,
]);
