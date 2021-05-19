import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';

export default {
  title: 'Payment Method Row',
};

const card = (cardName: string) => {
  return (
    <>
      <PaymentMethodRow
        lastFour={'1234'}
        expiry={'10/2025'}
        isDefault={true}
        paymentMethod={cardName}
      />
      <PaymentMethodRow
        lastFour={'1234'}
        expiry={'10/2025'}
        isDefault={false}
        paymentMethod={cardName}
      />
      <PaymentMethodRow
        lastFour={'1234'}
        expiry={'10/2020'}
        isDefault={true}
        paymentMethod={cardName}
      />
      <PaymentMethodRow
        lastFour={'1234'}
        expiry={'10/2020'}
        isDefault={false}
        paymentMethod={cardName}
      />
    </>
  );
};

export const Visa = () => card('Visa');

export const Mastercard = () => card('Mastercard');

export const Amex = () => card('Amex');

export const Discover = () => card('Discover');

export const JCB = () => card('JCB');

export const GooglePay = () => (
  <>
    <PaymentMethodRow isDefault={true} paymentMethod={'GooglePay'} />
    <PaymentMethodRow isDefault={false} paymentMethod={'GooglePay'} />
  </>
);

export const PayPal = () => (
  <>
    <PaymentMethodRow isDefault={true} paymentMethod={'PayPal'} />
    <PaymentMethodRow isDefault={false} paymentMethod={'PayPal'} />
  </>
);
