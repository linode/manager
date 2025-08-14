import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { BillingRoute } from './BillingRoute';

interface BillingSearch {
  action?: 'add-payment-method' | 'edit' | 'make-payment';
  contactDrawerOpen?: boolean;
  focusEmail?: boolean;
  paymentMethodId?: number;
}

const billingRoute = createRoute({
  component: BillingRoute,
  getParentRoute: () => rootRoute,
  path: 'billing',
  validateSearch: (search: BillingSearch) => search,
});

// Catch all route for billing page
const billingCatchAllRoute = createRoute({
  getParentRoute: () => billingRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/billing' });
  },
});

// Index route: /billing (main billing content)
const billingIndexRoute = createRoute({
  getParentRoute: () => billingRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account/billing`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/Billing/BillingLanding/billingLandingLazyRoute').then(
    (m) => m.billingLandingLazyRoute
  )
);

const billingInvoiceDetailsRoute = createRoute({
  getParentRoute: () => billingRoute,
  parseParams: (params) => ({
    invoiceId: Number(params.invoiceId),
  }),
  path: 'invoices/$invoiceId',
  beforeLoad: ({ context, params }) => {
    if (!context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account/billing/invoices/$invoiceId`,
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

// Catch all route for invoice details page
const billingInvoiceDetailsCatchAllRoute = createRoute({
  getParentRoute: () => billingRoute,
  path: 'invoices/$invoiceId/$invalidPath',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/billing/invoices/$invoiceId',
      params: { invoiceId: Number(params.invoiceId) },
    });
  },
});

export const billingRouteTree = billingRoute.addChildren([
  billingIndexRoute,
  billingCatchAllRoute,
  billingInvoiceDetailsRoute.addChildren([billingInvoiceDetailsCatchAllRoute]),
]);
