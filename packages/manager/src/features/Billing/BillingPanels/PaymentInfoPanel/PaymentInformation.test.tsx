// import { fireEvent } from '@testing-library/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as React from 'react';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
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
        <PaymentInformation
          loading={true}
          paymentMethods={paymentMethods}
          isAkamaiCustomer={false}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText('Content is loading')).toBeVisible();
  });

  it('Shows Add Payment button for Linode customers and hides it for Akamai customers', () => {
    const { queryByText, getByTestId, rerender } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          loading={false}
          paymentMethods={paymentMethods}
          isAkamaiCustomer={false}
        />
      </PayPalScriptProvider>
    );

    expect(getByTestId('payment-info-add-payment-method')).toBeInTheDocument();

    rerender(
      wrapWithTheme(
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PaymentInformation
            loading={false}
            paymentMethods={paymentMethods}
            isAkamaiCustomer={true}
          />
        </PayPalScriptProvider>
      )
    );

    expect(queryByText('Add Payment Method')).toBeNull();
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

  it('Lists all payment methods for Linode customers', () => {
    const { getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          loading={false}
          paymentMethods={paymentMethods}
          isAkamaiCustomer={false}
        />
      </PayPalScriptProvider>
    );

    paymentMethods.forEach((paymentMethod) => {
      expect(
        getByTestId(`payment-method-row-${paymentMethod.id}`)
      ).toBeVisible();
    });
  });

  it('Hides payment methods and shows text for Akamai customers', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          loading={false}
          paymentMethods={paymentMethods}
          isAkamaiCustomer={true}
        />
      </PayPalScriptProvider>
    );

    paymentMethods.forEach((paymentMethod) => {
      expect(
        queryByTestId(`payment-method-row-${paymentMethod.id}`)
      ).toBeNull();
    });
    expect(getByTestId('akamai-customer-text')).toBeInTheDocument();
  });
});
