import { PaymentMethod } from '@linode/api-v4';
import * as Factory from 'factory.ts';

export const paymentMethodFactory = Factory.Sync.makeFactory<PaymentMethod>({
  id: Factory.each((id) => id),
  data: {
    expiry: '12/2022',
    last_four: '1881',
    card_type: 'Visa',
  },
  created: '2021-05-21T14:27:51',
  type: 'credit_card',
  is_default: false,
});
