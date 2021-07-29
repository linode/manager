import * as Factory from 'factory.ts';
import { PaymentMethod } from '@linode/api-v4';
import { pickRandom } from 'src/utilities/random';

export const paymentMethodFactory = Factory.Sync.makeFactory<PaymentMethod>({
  id: Factory.each((id) => id),
  data: Factory.each(() => ({
    expiry: '12/2022',
    last_four: '1881',
    card_type: pickRandom([
      'Visa',
      'MasterCard',
      'Discover',
      'American Express',
      'JCB',
    ]),
  })),
  created: '2021-05-21T14:27:51',
  type: Factory.each(() =>
    pickRandom(['credit_card', 'credit_card', 'google_pay'])
  ),
  is_default: false,
});
