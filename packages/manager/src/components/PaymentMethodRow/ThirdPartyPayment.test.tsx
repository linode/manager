import * as React from 'react';

import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ThirdPartyPayment } from './ThirdPartyPayment';

it('Displays credit card type and last four digits when payment method is Google Pay', () => {
  const googlePayPaymentMethod = paymentMethodFactory.build({
    data: {
      card_type: 'Visa',
      last_four: '1881',
    },
    type: 'google_pay',
  });

  const { getByText } = renderWithTheme(
    <ThirdPartyPayment paymentMethod={googlePayPaymentMethod} />
  );

  expect(getByText('Google Pay')).toBeVisible();
  expect(getByText('Visa ****1881')).toBeVisible();
});

it('Displays PayPal email address when payment method type is PayPal', () => {
  const payPalPaymentMethod = paymentMethodFactory.build({
    data: {
      email: 'testpaypaluser@example.com',
      paypal_id: '123456',
    },
    is_default: false,
    type: 'paypal',
  });

  const { getByText } = renderWithTheme(
    <ThirdPartyPayment paymentMethod={payPalPaymentMethod} />
  );

  expect(getByText('PayPal')).toBeVisible();
  expect(getByText('testpaypaluser@example.com')).toBeVisible();
});
