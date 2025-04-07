import { profileFactory } from '@linode/utilities';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PaymentInformation from './PaymentInformation';

const ADD_PAYMENT_METHOD_BUTTON_ID = 'payment-info-add-payment-method';

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/account');
  return {
    ...actual,
    getClientToken: vi.fn().mockResolvedValue('mockedBraintreeClientToken'),
  };
});

const queryMocks = vi.hoisted(() => ({
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
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

const props = {
  isAkamaiCustomer: false,
  loading: false,
  paymentMethods,
  profile: queryMocks.useProfile().data,
};

describe('Payment Info Panel', () => {
  it('Shows loading animation when loading', () => {
    const { getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} loading={true} />
      </PayPalScriptProvider>
    );

    expect(getByLabelText('Content is loading')).toBeVisible();
  });

  it('Shows Add Payment button for Linode customers and hides it for Akamai customers', () => {
    const { getByTestId, queryByText, rerender } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} loading={false} />
      </PayPalScriptProvider>
    );

    expect(getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID)).toBeInTheDocument();

    rerender(
      wrapWithTheme(
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} isAkamaiCustomer={true} />
        </PayPalScriptProvider>
      )
    );

    expect(queryByText('Add Payment Method')).toBeNull();
  });

  it('Opens "Add Payment Method" drawer when "Add Payment Method" is clicked', () => {
    const { getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} />
      </PayPalScriptProvider>
    );

    const addPaymentMethodButton = getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID);

    fireEvent.click(addPaymentMethodButton);
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Lists all payment methods for Linode customers', () => {
    const { getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} />
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
        <PaymentInformation {...props} isAkamaiCustomer={true} />
      </PayPalScriptProvider>
    );

    paymentMethods.forEach((paymentMethod) => {
      expect(
        queryByTestId(`payment-method-row-${paymentMethod.id}`)
      ).toBeNull();
    });
    expect(getByTestId('akamai-customer-text')).toBeInTheDocument();
  });

  describe('Add Payment Method', () => {
    it('should be disabled for all child users', () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({
          restricted: false,
          user_type: 'child',
        }),
      });

      const { getByTestId } = renderWithTheme(
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PaymentInformation
            {...props}
            profile={queryMocks.useProfile().data}
          />
        </PayPalScriptProvider>
      );

      expect(getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID)).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('should be disabled for restricted users', () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({
          restricted: true,
          user_type: 'default',
        }),
      });

      queryMocks.useGrants.mockReturnValue({
        data: grantsFactory.build({
          global: {
            account_access: 'read_only',
          },
        }),
      });

      const { getByTestId } = renderWithTheme(
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} />
        </PayPalScriptProvider>
      );

      const addPaymentMethodButton = getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID);

      expect(addPaymentMethodButton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
