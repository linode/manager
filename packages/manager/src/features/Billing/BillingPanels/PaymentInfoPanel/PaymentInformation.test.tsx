// import { fireEvent } from '@testing-library/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as React from 'react';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import PaymentInformation from './PaymentInformation';

jest.mock('@linode/api-v4/lib/account', () => {
  return {
    getClientToken: jest.fn().mockResolvedValue('mockedBraintreeClientToken'),
  };
});

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
  it('Shows loading animation when loading', () => {
    const { getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation loading={true} paymentMethods={paymentMethods} />
      </PayPalScriptProvider>
    );

    expect(getByLabelText('Content is loading')).toBeVisible();
  });

  // @TODO: Restore `PaymentInformation.test.tsx` tests. See M3-5768 for more information.
  // it('Opens "Add Payment Method" drawer when "Add Payment Method" is clicked', () => {
  //   const { getByTestId } = renderWithTheme(
  //     <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
  //       <PaymentInformation loading={false} paymentMethods={paymentMethods} />
  //     </PayPalScriptProvider>
  //   );

  //   const addPaymentMethodButton = getByTestId(
  //     'payment-info-add-payment-method'
  //   );

  //   fireEvent.click(addPaymentMethodButton);
  //   expect(getByTestId('drawer')).toBeVisible();
  // });

  // it('Lists all payment methods', () => {
  //   const { getByTestId } = renderWithTheme(
  //     <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
  //       <PaymentInformation loading={false} paymentMethods={paymentMethods} />
  //     </PayPalScriptProvider>
  //   );

  //   paymentMethods.forEach((paymentMethod) => {
  //     expect(
  //       getByTestId(`payment-method-row-${paymentMethod.id}`)
  //     ).toBeVisible();
  //   });
  // });
});
