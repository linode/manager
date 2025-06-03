import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { AccountRoute } from './AccountRoute';

import type { PaymentMethod } from '@linode/api-v4';

interface AccountBillingSearch {
  contactDrawerOpen?: boolean;
  focusEmail?: boolean;
}

interface AccountBillingMakePaymentSearch {
  paymentMethod?: PaymentMethod;
}

const accountRoute = createRoute({
  component: AccountRoute,
  getParentRoute: () => rootRoute,
  path: 'account',
});

const accountIndexRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountBillingRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing',
  validateSearch: (search: AccountBillingSearch) => search,
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountUsersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/users',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountQuotasRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/quotas',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountLoginHistoryRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/login-history',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountServiceTransfersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/service-transfers',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountMaintenanceRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/maintenance',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/settings',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountUsersUsernameRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'users/$username',
}).lazy(() =>
  import('src/features/Users/UserDetail').then((m) => m.userDetailLazyRoute)
);

const accountUsersUsernameProfileRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Users/UserDetail').then((m) => m.userDetailLazyRoute)
);

const accountUsersUsernamePermissionsRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'permissions',
}).lazy(() =>
  import('src/features/Users/UserDetail').then((m) => m.userDetailLazyRoute)
);

const accountBillingMakePaymentRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing/make-payment',
  validateSearch: (search: AccountBillingMakePaymentSearch) => search,
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountBillingPaymentMethodsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing/add-payment-method',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountBillingEditRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing/edit',
}).lazy(() =>
  import('./accountLazyRoutes').then((m) => m.accountLandingLazyRoute)
);

const accountInvoicesInvoiceIdRoute = createRoute({
  getParentRoute: () => accountRoute,
  parseParams: (params) => ({
    invoiceId: Number(params.invoiceId),
  }),
  path: 'billing/invoices/$invoiceId',
}).lazy(() =>
  import('src/features/Billing/InvoiceDetail/InvoiceDetail').then(
    (m) => m.invoiceDetailLazyRoute
  )
);

const accountEntityTransfersCreateRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'service-transfers/create',
}).lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersCreate/EntityTransfersCreate'
  ).then((m) => m.entityTransfersCreateLazyRoute)
);

export const accountRouteTree = accountRoute.addChildren([
  accountIndexRoute,
  accountUsersRoute,
  accountQuotasRoute,
  accountLoginHistoryRoute,
  accountServiceTransfersRoute,
  accountMaintenanceRoute,
  accountSettingsRoute,
  accountUsersUsernameRoute.addChildren([
    accountUsersUsernameProfileRoute,
    accountUsersUsernamePermissionsRoute,
  ]),
  accountBillingRoute,
  accountBillingMakePaymentRoute,
  accountBillingPaymentMethodsRoute,
  accountBillingEditRoute,
  accountInvoicesInvoiceIdRoute,
  accountEntityTransfersCreateRoute,
]);
