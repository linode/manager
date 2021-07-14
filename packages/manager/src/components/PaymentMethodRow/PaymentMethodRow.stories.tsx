import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';
import { CardType } from '@linode/api-v4/lib/account/types';

export default {
  title: 'Payment Method Row',
};

const card = (type: CardType) => {
  return (
    <>
      <PaymentMethodRow
        paymentMethod={{
          id: 0,
          type: 'credit_card',
          is_default: true,
          created: '2021-06-01T20:14:49',
          data: {
            card_type: type,
            last_four: '1234',
            expiry: '10/2025',
          },
        }}
      />
      <PaymentMethodRow
        paymentMethod={{
          id: 0,
          type: 'credit_card',
          is_default: false,
          created: '2021-06-01T20:14:49',
          data: {
            card_type: type,
            last_four: '1234',
            expiry: '10/2025',
          },
        }}
      />
    </>
  );
};

export const Visa = () => card('Visa');

export const Mastercard = () => card('MasterCard');

export const Amex = () => card('American Express');

export const Discover = () => card('Discover');

export const JCB = () => card('JCB');

// @ts-expect-error This is just an example
export const Other = () => card('Other');

export const GooglePay = () => (
  <>
    <PaymentMethodRow
      paymentMethod={{
        id: 0,
        data: {
          card_type: 'Discover',
          expiry: '12/2022',
          last_four: '1111',
        },
        is_default: true,
        created: '2021-06-01T20:14:49',
        type: 'google_pay',
      }}
    />
    <PaymentMethodRow
      paymentMethod={{
        id: 0,
        data: {
          card_type: 'Discover',
          expiry: '12/2022',
          last_four: '1111',
        },
        is_default: false,
        created: '2021-06-01T20:14:49',
        type: 'google_pay',
      }}
    />
  </>
);

export const PayPal = () => (
  <>
    <PaymentMethodRow
      paymentMethod={{
        id: 0,
        data: {
          card_type: 'Discover',
          expiry: '12/2022',
          last_four: '1111',
        },
        is_default: true,
        created: '2021-06-01T20:14:49',
        type: 'paypal',
      }}
    />
    <PaymentMethodRow
      paymentMethod={{
        id: 0,
        data: {
          card_type: 'Discover',
          expiry: '12/2022',
          last_four: '1111',
        },
        is_default: false,
        created: '2021-06-01T20:14:49',
        type: 'paypal',
      }}
    />
  </>
);
