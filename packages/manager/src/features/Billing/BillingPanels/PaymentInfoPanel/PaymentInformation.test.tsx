import { grantsFactory, profileFactory } from '@linode/utilities';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import {
  renderWithThemeAndRouter,
  wrapWithTheme,
  wrapWithThemeAndRouter,
} from 'src/utilities/testHelpers';

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
  useMatch: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatch: queryMocks.useMatch,
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
  it('Shows loading animation when loading', async () => {
    const { getByLabelText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} loading={true} />
      </PayPalScriptProvider>
    );

    expect(getByLabelText('Content is loading')).toBeVisible();
  });

  it('Shows Add Payment button for Linode customers and hides it for Akamai customers', async () => {
    const { getByTestId, queryByText, rerender } =
      await renderWithThemeAndRouter(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} loading={false} />
        </PayPalScriptProvider>
      );

    expect(getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID)).toBeInTheDocument();

    rerender(
      wrapWithTheme(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} isAkamaiCustomer={true} />
        </PayPalScriptProvider>
      )
    );

    expect(queryByText('Add Payment Method')).toBeNull();
  });

  it('Opens "Add Payment Method" drawer when "Add Payment Method" is clicked', async () => {
    const { getByTestId, rerender } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );

    const addPaymentMethodButton = getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID);

    fireEvent.click(addPaymentMethodButton);
    queryMocks.useMatch.mockReturnValue({
      routeId: '/account/billing/add-payment-method',
    });
    rerender(
      wrapWithThemeAndRouter(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} />
        </PayPalScriptProvider>
      )
    );
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Lists all payment methods for Linode customers', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentInformation {...props} />
      </PayPalScriptProvider>
    );

    paymentMethods.forEach((paymentMethod) => {
      expect(
        getByTestId(`payment-method-row-${paymentMethod.id}`)
      ).toBeVisible();
    });
  });

  it('Hides payment methods and shows text for Akamai customers', async () => {
    const { getByTestId, queryByTestId } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
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
    it('should be disabled for all child users', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({
          restricted: false,
          user_type: 'child',
        }),
      });

      const { getByTestId } = await renderWithThemeAndRouter(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
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

    it('should be disabled for restricted users', async () => {
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

      const { getByTestId } = await renderWithThemeAndRouter(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <PaymentInformation {...props} />
        </PayPalScriptProvider>
      );

      const addPaymentMethodButton = getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID);

      expect(addPaymentMethodButton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
