import * as React from 'react';
import PaymentMethodRow from './PaymentMethodRow';
import ThemeDecorator from '../../utilities/storybookDecorators';

export default {
  title: 'Payment Method Row',
  decorators: [ThemeDecorator],
};

export const Visa = () => (
  <>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={true}
      paymentMethod={'Visa'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={false}
      paymentMethod={'Visa'}
    ></PaymentMethodRow>
  </>
);

export const Mastercard = () => (
  <>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={true}
      paymentMethod={'Mastercard'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={false}
      paymentMethod={'Mastercard'}
    ></PaymentMethodRow>
  </>
);

export const Amex = () => (
  <>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={true}
      paymentMethod={'Amex'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={false}
      paymentMethod={'Amex'}
    ></PaymentMethodRow>
  </>
);

export const Discover = () => (
  <>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={true}
      paymentMethod={'Discover'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={false}
      paymentMethod={'Discover'}
    ></PaymentMethodRow>
  </>
);

export const JCB = () => (
  <>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={true}
      paymentMethod={'JCB'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      lastFour={'1234'}
      expiry={'10/2022'}
      isDefault={false}
      paymentMethod={'JCB'}
    ></PaymentMethodRow>
  </>
);

export const GooglePay = () => (
  <>
    <PaymentMethodRow
      isDefault={true}
      paymentMethod={'GooglePay'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      isDefault={false}
      paymentMethod={'GooglePay'}
    ></PaymentMethodRow>
  </>
);

export const PayPal = () => (
  <>
    <PaymentMethodRow
      isDefault={true}
      paymentMethod={'PayPal'}
    ></PaymentMethodRow>
    <PaymentMethodRow
      isDefault={false}
      paymentMethod={'PayPal'}
    ></PaymentMethodRow>
  </>
);
