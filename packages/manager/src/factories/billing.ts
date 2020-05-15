import * as Factory from 'factory.ts';
import { InvoiceItem, Payment, Invoice } from '@linode/api-v4/lib/account';

export const invoiceItemFactory = Factory.Sync.makeFactory<InvoiceItem>({
  label: Factory.each(i => `Nanode 1GB - my-linode-${i} (${i})`),
  unit_price: '0.0075',
  amount: 5,
  quantity: 730,
  tax: 0,
  total: 5,
  from: '2020-01-01T12:00:00',
  to: '2020-01-31T12:00:00',
  type: 'hourly'
});

const paymentDate = new Date('2020-01-01T00:00:00');
export const paymentFactory = Factory.Sync.makeFactory<Payment>({
  date: Factory.each(i => {
    paymentDate.setDate(paymentDate.getDate() - i + 1);
    return paymentDate.toISOString();
  }),
  id: Factory.each(i => i),
  usd: 5
});

const invoiceDate = new Date('2020-01-01T00:00:00');
export const invoiceFactory = Factory.Sync.makeFactory<Invoice>({
  date: Factory.each(i => {
    invoiceDate.setDate(invoiceDate.getDate() - i + 1);
    return invoiceDate.toISOString();
  }),
  id: Factory.each(i => i),
  subtotal: 5,
  tax: 1,
  total: 6,
  label: Factory.each(i => `Invoice #${i}`)
});
