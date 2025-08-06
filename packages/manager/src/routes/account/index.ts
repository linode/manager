import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { AccountRoute } from './AccountRoute';

interface AccountBillingSearch {
  action?: 'add-payment-method' | 'edit' | 'make-payment';
  contactDrawerOpen?: boolean;
  focusEmail?: boolean;
  paymentMethodId?: number;
}

const accountRoute = createRoute({
  component: AccountRoute,
  getParentRoute: () => rootRoute,
  path: 'account',
});

const accountTabsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Account/accountLandingLazyRoute').then(
    (m) => m.accountLandingLazyRoute
  )
);

const accountBillingRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/billing',
  validateSearch: (search: AccountBillingSearch) => search,
}).lazy(() =>
  import('src/features/Billing/billingDetailLazyRoute').then(
    (m) => m.billingDetailLazyRoute
  )
);

const accountUsersRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/users',
}).lazy(() =>
  import('src/features/Users/usersLandingLazyRoute').then(
    (m) => m.usersLandingLazyRoute
  )
);

const accountQuotasRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/quotas',
}).lazy(() =>
  import('src/features/Account/Quotas/quotasLazyRoute').then(
    (m) => m.quotasLazyRoute
  )
);

const accountLoginHistoryRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/login-history',
}).lazy(() =>
  import('src/features/Account/accountLoginsLazyRoute').then(
    (m) => m.accountLoginsLazyRoute
  )
);

const accountServiceTransfersRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/service-transfers',
}).lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersLanding/entityTransferLandingLazyRoute'
  ).then((m) => m.entityTransferLandingLazyRoute)
);

const accountMaintenanceRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/maintenance',
}).lazy(() =>
  import('src/features/Account/Maintenance/maintenanceLandingLazyRoute').then(
    (m) => m.maintenanceLandingLazyRoute
  )
);

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
  path: '/settings',
}).lazy(() =>
  import('src/features/Account/globalSettingsLazyRoute').then(
    (m) => m.globalSettingsLazyRoute
  )
);

const accountUsersUsernameRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/users/$username',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const accountUsersUsernameProfileRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'profile',
  beforeLoad: async ({ context }) => {
    const { isIAMEnabled } = context;
    const username = context.profile?.username;

    if (!isIAMEnabled || !username) {
      return;
    }

    throw redirect({
      to: '/iam/users/$username/details',
      params: { username },
      replace: true,
    });
  },
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const accountUsersUsernamePermissionsRoute = createRoute({
  getParentRoute: () => accountUsersUsernameRoute,
  path: 'permissions',
  beforeLoad: async ({ context }) => {
    const { isIAMEnabled } = context;
    const username = context.profile?.username;

    if (!isIAMEnabled || !username) {
      return;
    }

    throw redirect({
      to: '/iam/users/$username/roles',
      params: { username },
      replace: true,
    });
  },
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const accountInvoiceDetailsRoute = createRoute({
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
  accountTabsRoute.addChildren([
    accountBillingRoute,
    accountUsersRoute,
    accountQuotasRoute,
    accountLoginHistoryRoute,
    accountServiceTransfersRoute,
    accountMaintenanceRoute,
    accountSettingsRoute,
  ]),
  accountInvoiceDetailsRoute,
  accountEntityTransfersCreateRoute,
  accountUsersUsernameRoute.addChildren([
    accountUsersUsernameProfileRoute,
    accountUsersUsernamePermissionsRoute,
  ]),
]);
