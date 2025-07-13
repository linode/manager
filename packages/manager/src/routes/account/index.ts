import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { AccountRoute } from './AccountRoute';

import type { PaymentMethod } from '@linode/api-v4';
interface AccountBillingSearch {
  action?: 'add-payment-method' | 'edit' | 'make-payment';
  contactDrawerOpen?: boolean;
  focusEmail?: boolean;
  paymentMethod?: PaymentMethod;
}

const accountRoute = createRoute({
  component: AccountRoute,
  getParentRoute: () => rootRoute,
  path: 'account',
}).lazy(() =>
  import('src/features/Account/accountLandingLazyRoute').then(
    (m) => m.accountLandingLazyRoute
  )
);

const accountBillingRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing',
  validateSearch: (search: AccountBillingSearch) => search,
}).lazy(() =>
  import('src/features/Billing/billingDetailLazyRoute').then(
    (m) => m.billingDetailLazyRoute
  )
);

const accountUsersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/users',
}).lazy(() =>
  import('src/features/Users/usersLandingLazyRoute').then(
    (m) => m.usersLandingLazyRoute
  )
);

const accountQuotasRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/quotas',
}).lazy(() =>
  import('src/features/Account/Quotas/quotasLazyRoute').then(
    (m) => m.quotasLazyRoute
  )
);

const accountLoginHistoryRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/login-history',
}).lazy(() =>
  import('src/features/Account/accountLoginsLazyRoute').then(
    (m) => m.accountLoginsLazyRoute
  )
);

const accountServiceTransfersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/service-transfers',
}).lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersLanding/entityTransferLandingLazyRoute'
  ).then((m) => m.entityTransferLandingLazyRoute)
);

const accountMaintenanceRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/maintenance',
}).lazy(() =>
  import('src/features/Account/Maintenance/maintenanceLandingLazyRoute').then(
    (m) => m.maintenanceLandingLazyRoute
  )
);

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/settings',
}).lazy(() =>
  import('src/features/Account/globalSettingsLazyRoute').then(
    (m) => m.globalSettingsLazyRoute
  )
);

const accountUsersUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'account/users/$username',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const accountUsersUsernameProfileRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const accountUsersUsernamePermissionsRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'permissions',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
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
  accountInvoicesInvoiceIdRoute,
  accountEntityTransfersCreateRoute,
]);
