import * as Factory from 'factory.ts';
import { InvoiceItem } from '@linode/api-v4/lib/account';

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
