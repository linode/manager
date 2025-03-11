import { PaymentMethod } from '@linode/api-v4';
import { Factory } from '@linode/utilities';

export const paymentMethodFactory = Factory.Sync.makeFactory<PaymentMethod>({
  created: '2021-05-21T14:27:51',
  data: {
    card_type: 'Visa',
    expiry: '12/2022',
    last_four: '1881',
  },
  id: Factory.each((id) => id),
  is_default: false,
  type: 'credit_card',
});
