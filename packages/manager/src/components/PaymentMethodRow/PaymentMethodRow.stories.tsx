import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';
import { PaymentType, CardType } from '@linode/api-v4/lib/account/types';

export default {
  title: 'Payment Method Row',
};

const render = (paymentMethodType: PaymentType, cardType: CardType) => {
  return (
    <>
      <PaymentMethodRow
        paymentMethod={{
          type: paymentMethodType,
          id: 0,
          is_default: true,
          created: '2021-06-01T20:14:49',
          data: {
            card_type: cardType,
            last_four: '1234',
            expiry: '10/2025',
          },
        }}
      />
      <PaymentMethodRow
        paymentMethod={{
          type: paymentMethodType,
          id: 1,
          is_default: false,
          created: '2021-06-01T20:14:49',
          data: {
            card_type: cardType,
            last_four: '1234',
            expiry: '10/2025',
          },
        }}
      />
    </>
  );
};

export const Visa = () => render('credit_card', 'Visa');

export const Mastercard = () => render('credit_card', 'MasterCard');

export const Amex = () => render('credit_card', 'American Express');

export const Discover = () => render('credit_card', 'Discover');

export const JCB = () => render('credit_card', 'JCB');

// @ts-expect-error This is just an example
export const Other = () => render('credit_card', 'Other');

export const GooglePay = () => render('google_pay', 'Discover');

export const PayPal = () => render('paypal', 'MasterCard');
