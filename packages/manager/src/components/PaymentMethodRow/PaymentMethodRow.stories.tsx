import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';
import { paymentMethodFactory } from 'src/factories';
import { CardType } from '@linode/api-v4/lib';

export default {
  title: 'Components/Payment Method Row',
};

const onDelete = () => {
  // ...
};

const creditCards: CardType[] = [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'JCB',
  // @ts-expect-error Check the fallback case
  'Other',
];

export const CreditCards = () =>
  creditCards.map((creditCard) => (
    <PaymentMethodRow
      key={creditCard}
      onDelete={onDelete}
      paymentMethod={paymentMethodFactory.build({
        type: 'credit_card',
        data: {
          card_type: creditCard,
        },
      })}
    />
  ));

export const GooglePay = () => (
  <PaymentMethodRow
    onDelete={onDelete}
    paymentMethod={paymentMethodFactory.build({
      type: 'google_pay',
      data: {
        card_type: 'Visa',
      },
    })}
  />
);

export const Paypal = () => (
  <PaymentMethodRow
    onDelete={onDelete}
    paymentMethod={paymentMethodFactory.build({
      type: 'paypal',
      data: {
        paypal_id: 'ABCDEFG123',
        email: 'testemail@gmail.com',
      },
    })}
  />
);
