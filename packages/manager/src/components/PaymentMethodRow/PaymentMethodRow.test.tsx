import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import BillingSummary from 'src/features/Billing/BillingPanels/BillingSummary';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PaymentMethodRow } from './PaymentMethodRow';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => navigate),
  useMatch: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useMatch: queryMocks.useMatch,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/account');
  return {
    ...actual,
    getClientToken: vi.fn().mockResolvedValue('mockedBraintreeClientToken'),
    makeDefaultPaymentMethod: vi.fn().mockResolvedValue({}),
  };
});

describe('Payment Method Row', () => {
  it('Displays "Default" chip if payment method is set as default', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
        />
      </PayPalScriptProvider>
    );

    expect(getByText('DEFAULT')).toBeVisible();
  });

  it('Does not display "Default" chip if payment method is not set as default', async () => {
    const { queryByText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodFactory.build({ is_default: false })}
        />
      </PayPalScriptProvider>
    );

    expect(queryByText('DEFAULT')).toBeNull();
  });

  it('Has default ARIA label for credit card and Google Pay payment methods', async () => {
    const expectedLabelCreditCard = 'Action menu for card ending in 1881';
    const expectedLabelGooglePay = 'Action menu for card ending in 1111';

    const paymentMethodCreditCard = paymentMethodFactory.build({
      data: {
        card_type: 'Visa',
        expiry: '12/2022',
        last_four: '1881',
      },
      is_default: false,
      type: 'credit_card',
    });

    const paymentMethodGooglePay = paymentMethodFactory.build({
      data: {
        card_type: 'Visa',
        expiry: '12/2022',
        last_four: '1111',
      },
      is_default: false,
      type: 'google_pay',
    });

    const { getByLabelText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodCreditCard}
        />
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodGooglePay}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText(expectedLabelCreditCard)).toBeVisible();
    expect(getByLabelText(expectedLabelGooglePay)).toBeVisible();
  });

  it('Has PayPal-specific ARIA label for PayPal payment methods', async () => {
    const expectedLabelPayPal =
      'Action menu for Paypal testpaypaluser@example.com';
    const payPalPaymentMethod = paymentMethodFactory.build({
      data: {
        email: 'testpaypaluser@example.com',
        paypal_id: '123456',
      },
      is_default: false,
      type: 'paypal',
    });

    const { getByLabelText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={payPalPaymentMethod}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText(expectedLabelPayPal)).toBeVisible();
  });

  it('Disables "Make Default" and "Delete" actions if payment method is set as default', async () => {
    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
        />
      </PayPalScriptProvider>
    );
    await userEvent.click(getByLabelText(/^Action menu for/));
    expect(
      getByText('Make Default').closest('li')?.getAttribute('aria-disabled')
    ).toEqual('true');
    expect(
      getByText('Delete').closest('li')?.getAttribute('aria-disabled')
    ).toEqual('true');
  });

  it('Calls `onDelete` callback when "Delete" action is clicked', async () => {
    const mockFunction = vi.fn();

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={mockFunction}
          paymentMethod={paymentMethodFactory.build({ is_default: false })}
        />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    await userEvent.click(actionMenu);

    const deleteActionButton = getByText('Delete');
    expect(deleteActionButton).toBeVisible();
    await userEvent.click(deleteActionButton);

    expect(mockFunction).toBeCalledTimes(1);
  });

  it('Makes payment method default when "Make Default" action is clicked', async () => {
    const paymentMethod = paymentMethodFactory.build({
      data: {
        card_type: 'Visa',
        last_four: '1111',
      },
      is_default: false,
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow onDelete={vi.fn()} paymentMethod={paymentMethod} />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1111');
    await userEvent.click(actionMenu);

    const makeDefaultButton = getByText('Make Default');
    expect(makeDefaultButton).toBeVisible();
    await userEvent.click(makeDefaultButton);

    expect(makeDefaultPaymentMethod).toBeCalledTimes(1);
  });

  it('Opens "Make a Payment" drawer if "Make a Payment" action is clicked', async () => {
    const paymentMethod = paymentMethodFactory.build();

    /*
     * The <BillingSummary /> component is responsible for rendering the "Make a Payment" drawer,
     * and is required for this test. We may want to consider decoupling these components in the future.
     */
    const { getByLabelText, getByTestId, getByText, rerender } =
      await renderWithThemeAndRouter(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <BillingSummary
            balance={0}
            balanceUninvoiced={0}
            paymentMethods={[paymentMethod]}
          />
          <PaymentMethodRow onDelete={vi.fn()} paymentMethod={paymentMethod} />
        </PayPalScriptProvider>,
        {
          initialRoute: '/account/billing',
        }
      );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    await userEvent.click(actionMenu);

    const makePaymentButton = getByText('Make a Payment');
    expect(makePaymentButton).toBeVisible();
    await userEvent.click(makePaymentButton);

    queryMocks.useMatch.mockReturnValue({
      routeId: '/account/billing/make-payment',
    });
    queryMocks.useSearch.mockReturnValue({
      paymentMethod: paymentMethod,
    });

    rerender(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={0}
          balanceUninvoiced={0}
          paymentMethods={[paymentMethod]}
        />
        <PaymentMethodRow onDelete={vi.fn()} paymentMethod={paymentMethod} />
      </PayPalScriptProvider>
    );

    expect(navigate).toHaveBeenCalledWith({
      search: {
        paymentMethod: {
          created: '2021-05-21T14:27:51',
          data: {
            card_type: 'Visa',
            expiry: '12/2022',
            last_four: '1881',
          },
          id: 9,
          is_default: false,
          type: 'credit_card',
        },
      },
      to: '/account/billing/make-payment',
    });

    await waitFor(() => {
      expect(getByTestId('drawer')).toBeVisible();
      expect(getByTestId('drawer-title').textContent).toEqual('Make a Payment');
    });
  });
});
