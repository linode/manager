import {
  Invoice,
  InvoiceItem,
  Payment,
  PaymentResponse,
} from '@linode/api-v4/lib/account';
import { APIWarning } from '@linode/api-v4/lib/types';
import { Factory } from '@linode/utilities';

export const invoiceItemFactory = Factory.Sync.makeFactory<InvoiceItem>({
  amount: 5,
  from: '2020-01-01T12:00:00',
  label: Factory.each((i) => `Nanode 1GB - my-linode-${i} (${i})`),
  quantity: 730,
  region: 'id-cgk',
  tax: 0,
  to: '2020-01-31T12:00:00',
  total: 5,
  type: 'hourly',
  unit_price: '0.0075',
});

const paymentDate = new Date('2020-01-01T00:00:00');
export const paymentFactory = Factory.Sync.makeFactory<Payment>({
  date: Factory.each((i) => {
    paymentDate.setDate(paymentDate.getDate() - i + 1);
    return paymentDate.toISOString();
  }),
  id: Factory.each((i) => i),
  usd: 5,
});

const invoiceDate = new Date('2022-08-01T00:00:00');
export const invoiceFactory = Factory.Sync.makeFactory<Invoice>({
  date: Factory.each((i) => {
    invoiceDate.setDate(invoiceDate.getDate() - i + 1);
    return invoiceDate.toISOString();
  }),
  id: Factory.each((i) => i),
  label: Factory.each((i) => `Invoice #${i}`),
  subtotal: 50,
  tax: 5,
  tax_summary: [
    {
      name: 'PA STATE TAX',
      tax: 3,
    },
    {
      name: 'PA COUNTY TAX',
      tax: 2,
    },
  ],
  total: 55,
});

export const warningFactory = Factory.Sync.makeFactory<APIWarning>({
  detail:
    'Object Storage could not be reactivated, please open a support ticket.',
  title:
    'Your payment has been processed but we encountered an error releasing your resources.',
});

export const creditPaymentResponseFactory = Factory.Sync.makeFactory<PaymentResponse>(
  {
    date: '2020-01-01T12:00:00',
    id: Factory.each((i) => i),
    usd: 10,
    warnings: warningFactory.buildList(1),
  }
);
