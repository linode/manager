import { createRoute, redirect } from '@tanstack/react-router';

import { checkIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

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

const accountBillingRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'billing',
  validateSearch: (search: AccountBillingSearch) => search,
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/billing`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Billing/billingDetailLazyRoute').then(
    (m) => m.billingDetailLazyRoute
  )
);

const accountUsersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/users',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (isIAMEnabled) {
      throw redirect({ to: '/iam/users' });
    }
  },
}).lazy(() =>
  import('src/features/Users/usersLandingLazyRoute').then(
    (m) => m.usersLandingLazyRoute
  )
);

const accountQuotasRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/quotas',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/quotas`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Account/Quotas/quotasLazyRoute').then(
    (m) => m.quotasLazyRoute
  )
);

const accountLoginHistoryRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/login-history',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/login-history`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Account/accountLoginsLazyRoute').then(
    (m) => m.accountLoginsLazyRoute
  )
);

const accountServiceTransfersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/service-transfers',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/service-transfers`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersLanding/entityTransferLandingLazyRoute'
  ).then((m) => m.entityTransferLandingLazyRoute)
);

const accountMaintenanceRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/maintenance',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/maintenance`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Account/Maintenance/maintenanceLandingLazyRoute').then(
    (m) => m.maintenanceLandingLazyRoute
  )
);

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/settings',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/settings`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Account/globalSettingsLazyRoute').then(
    (m) => m.globalSettingsLazyRoute
  )
);

const accountUsersUsernameRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/users/$username',
  beforeLoad: async ({ context, params, location }) => {
    const { username } = params;

    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (!isIAMEnabled || !username) {
      return;
    }

    if (location.pathname.endsWith('/permissions')) {
      throw redirect({
        to: '/iam/users/$username/roles',
        params: { username },
        replace: true,
      });
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

const accountInvoiceDetailsRoute = createRoute({
  getParentRoute: () => accountRoute,
  parseParams: (params) => ({
    invoiceId: Number(params.invoiceId),
  }),
  path: 'billing/invoices/$invoiceId',
  beforeLoad: ({ context, params }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/billing/invoices/$invoiceId`,
        params: { invoiceId: params.invoiceId },
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Billing/InvoiceDetail/InvoiceDetail').then(
    (m) => m.invoiceDetailLazyRoute
  )
);

const accountEntityTransfersCreateRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'service-transfers/create',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/service-transfers/create`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersCreate/entityTransfersCreateLazyRoute'
  ).then((m) => m.entityTransfersCreateLazyRoute)
);

export const accountRouteTree = accountRoute.addChildren([
  accountBillingRoute,
  accountUsersRoute,
  accountQuotasRoute,
  accountLoginHistoryRoute,
  accountServiceTransfersRoute,
  accountMaintenanceRoute,
  accountSettingsRoute,
  accountInvoiceDetailsRoute,
  accountEntityTransfersCreateRoute,
  accountUsersUsernameRoute.addChildren([
    accountUsersUsernameProfileRoute,
    accountUsersUsernamePermissionsRoute,
  ]),
]);
