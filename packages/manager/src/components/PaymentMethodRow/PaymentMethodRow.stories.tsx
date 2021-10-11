import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';
import { paymentMethodFactory } from 'src/factories';
import { PaymentMethod } from '@linode/api-v4';

export default {
  title: 'Components/Payment Method Row',
};

const onDelete = () => {
  // ...
};

const render = (paymentMethod: PaymentMethod) => (
  <PaymentMethodRow onDelete={onDelete} paymentMethod={paymentMethod} />
);

export const Visa = () =>
  render(
    paymentMethodFactory.build({
      type: 'credit_card',
      data: {
        card_type: 'Visa',
      },
    })
  );
