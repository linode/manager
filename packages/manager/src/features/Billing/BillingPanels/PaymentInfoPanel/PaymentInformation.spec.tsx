import { fireEvent } from '@testing-library/react';
import PaymentInformation from './PaymentInformation';
import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';

/*
 * Build payment method list that includes 1 valid and default payment method,
 * 2 valid non-default payment methods, and 1 expired payment method.
 */
const paymentMethods = [
  paymentMethodFactory.build({
    is_default: true,
  }),
  ...paymentMethodFactory.buildList(2),
  paymentMethodFactory.build({
    data: {
      expiry: '12/2021',
    },
  }),
];

describe('Payment Info Panel', () => {
  const { getByTestId } = renderWithTheme(
    <PaymentInformation loading={false} paymentMethods={paymentMethods} />
  );

  const addPaymentMethodButton = getByTestId('payment-info-add-payment-method');

  it('opens "Add Payment Method" drawer when "Add Payment Method" is clicked', () => {
    fireEvent.click(addPaymentMethodButton);
    expect(getByTestId('drawer-title')).toBeVisible();
  });
});
