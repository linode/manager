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
        creditCard={{
          card_type: type,
          last_four: '1234',
          expiry: '10/2025',
        }}
        isDefault={true}
      />
      <PaymentMethodRow
        creditCard={{
          card_type: type,
          last_four: '1234',
          expiry: '10/2025',
        }}
        isDefault={false}
      />
      <PaymentMethodRow
        creditCard={{
          card_type: type,
          last_four: '1234',
          expiry: '10/2020',
        }}
        isDefault={true}
      />
      <PaymentMethodRow
        creditCard={{
          card_type: type,
          last_four: '1234',
          expiry: '10/2020',
        }}
        isDefault={false}
      />
    </>
  );
};

export const Visa = () => card('Visa');

export const Mastercard = () => card('Mastercard');

export const Amex = () => card('Amex');

export const Discover = () => card('Discover');

export const JCB = () => card('JCB');

export const Other = () => card('Other');

export const GooglePay = () => (
  <>
    <PaymentMethodRow isDefault={true} thirdPartyPayment={'GooglePay'} />
    <PaymentMethodRow isDefault={false} thirdPartyPayment={'GooglePay'} />
  </>
);

export const PayPal = () => (
  <>
    <PaymentMethodRow isDefault={true} thirdPartyPayment={'PayPal'} />
    <PaymentMethodRow isDefault={false} thirdPartyPayment={'PayPal'} />
  </>
);
