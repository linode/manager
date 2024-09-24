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

export const accountRoute = createRoute({
  component: AccountRoutes,
  getParentRoute: () => rootRoute,
  path: 'account',
});

export const accountIndexRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: '/',
});

export const accountUsersUsernameRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Users/UserDetail').then((module) => ({
      default: module.UserDetail,
    }))
  ),
  getParentRoute: () => accountRoute,
  path: 'users/$username',
});

export const accountBillingRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing',
});

export const accountBillingEditRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/Account/AccountLanding')
  ),
  getParentRoute: () => accountRoute,
  path: 'billing/edit',
});

export const accountInvoicesInvoiceIdRoute = createRoute({
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

export const accountEntityTransfersCreateRoute = createRoute({
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
