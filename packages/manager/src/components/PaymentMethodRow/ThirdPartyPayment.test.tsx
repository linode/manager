import ThirdPartyPayment from './ThirdPartyPayment';
import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';

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
    is_default: false,
    data: {
      paypal_id: '123456',
      email: 'testpaypaluser@example.com',
    },
    type: 'paypal',
  });

  const { getByText } = renderWithTheme(
    <ThirdPartyPayment paymentMethod={payPalPaymentMethod} />
  );

  expect(getByText('PayPal')).toBeVisible();
  expect(getByText('testpaypaluser@example.com')).toBeVisible();
});
