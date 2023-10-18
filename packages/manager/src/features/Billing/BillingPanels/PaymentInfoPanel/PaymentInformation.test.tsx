import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PaymentInformation from './PaymentInformation';

vi.mock('@linode/api-v4/lib/account', () => {
  return {
    getClientToken: vi.fn().mockResolvedValue('mockedBraintreeClientToken'),
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
          isAkamaiCustomer={false}
          loading={true}
          paymentMethods={paymentMethods}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText('Content is loading')).toBeVisible();
  });

  it('Shows Add Payment button for Linode customers and hides it for Akamai customers', () => {
    const { getByTestId, queryByText, rerender } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          isAkamaiCustomer={false}
          loading={false}
          paymentMethods={paymentMethods}
        />
      </PayPalScriptProvider>
    );

    expect(getByTestId('payment-info-add-payment-method')).toBeInTheDocument();

    rerender(
      wrapWithTheme(
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PaymentInformation
            isAkamaiCustomer={true}
            loading={false}
            paymentMethods={paymentMethods}
          />
        </PayPalScriptProvider>
      )
    );

    expect(queryByText('Add Payment Method')).toBeNull();
  });

  it('Opens "Add Payment Method" drawer when "Add Payment Method" is clicked', () => {
    const { getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          isAkamaiCustomer={false}
          loading={false}
          paymentMethods={paymentMethods}
        />
      </PayPalScriptProvider>
    );

    const addPaymentMethodButton = getByTestId(
      'payment-info-add-payment-method'
    );

    fireEvent.click(addPaymentMethodButton);
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Lists all payment methods for Linode customers', () => {
    const { getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation
          isAkamaiCustomer={false}
          loading={false}
          paymentMethods={paymentMethods}
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
          isAkamaiCustomer={true}
          loading={false}
          paymentMethods={paymentMethods}
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
