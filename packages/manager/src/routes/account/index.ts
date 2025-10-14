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
  path: 'billing',
  validateSearch: (search: AccountBillingSearch) => search,
  beforeLoad: ({ context, params }) => {
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
  getParentRoute: () => accountTabsRoute,
  path: '/users',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (isIAMEnabled) {
      throw redirect({ to: '/iam/users' });
    }

    if (context?.flags?.iamRbacPrimaryNavChanges && !isIAMEnabled) {
      throw redirect({ to: '/users' });
    }
  },
}).lazy(() =>
  import('src/features/Users/usersLandingLazyRoute').then(
    (m) => m.usersLandingLazyRoute
  )
);

const accountQuotasRoute = createRoute({
  getParentRoute: () => accountTabsRoute,
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
  getParentRoute: () => accountTabsRoute,
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
  getParentRoute: () => accountTabsRoute,
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
  getParentRoute: () => accountTabsRoute,
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
  getParentRoute: () => accountTabsRoute,
  path: '/settings',
  beforeLoad: ({ context }) => {
    if (context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account-settings`,
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

    if (!username) {
      return;
    }

    if (isIAMEnabled) {
      const url = location.pathname.endsWith('/permissions')
        ? '/iam/users/$username/roles'
        : '/iam/users/$username/details';

      throw redirect({
        to: url,
        params: { username },
        replace: true,
      });
    }

    if (context?.flags?.iamRbacPrimaryNavChanges && !isIAMEnabled) {
      const url = location.pathname.endsWith('/profile')
        ? '/users/$username/profile'
        : location.pathname.endsWith('/permissions')
          ? '/users/$username/permissions'
          : '/users/$username';
      throw redirect({
        to: url,
        params: { username },
        replace: true,
      });
    }
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
