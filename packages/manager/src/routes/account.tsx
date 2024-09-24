import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

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
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: '/',
});

const accountUsersUsernameRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Users/UserDetail').then((module) => ({
      default: module.UserDetail,
    }))
  ),
  getParentRoute: () => accountRoute,
  path: 'users/$username',
});

const accountBillingRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing',
});

const accountBillingEditRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing/edit',
});

const accountInvoicesInvoiceIdRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Billing/InvoiceDetail/InvoiceDetail').then(
      (module) => ({
        default: module.InvoiceDetail,
      })
    )
  ),
  getParentRoute: () => accountRoute,
  parseParams: (params) => ({
    invoiceId: Number(params.invoiceId),
  }),
  path: 'billing/invoices/$invoiceId',
});

const accountEntityTransfersCreateRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/EntityTransfers/EntityTransfersCreate/EntityTransfersCreate'
    ).then((module) => ({
      default: module.EntityTransfersCreate,
    }))
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
