import { createLazyRoute } from '@tanstack/react-router';

import { InvoiceDetail } from '../InvoiceDetail/InvoiceDetail';

export const invoiceDetailsLazyRoute = createLazyRoute(
  '/billing/invoices/$invoiceId'
)({
  component: InvoiceDetail,
});
