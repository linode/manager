import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import BillingSummary from 'src/features/Billing/BillingPanels/BillingSummary';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PaymentMethodRow } from './PaymentMethodRow';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      make_billing_payment: false,
      set_default_payment_method: false,
      delete_payment_method: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual('@linode/api-v4/lib/account');
  return {
    ...actual,
    getClientToken: vi.fn().mockResolvedValue('mockedBraintreeClientToken'),
    makeDefaultPaymentMethod: vi.fn().mockResolvedValue({}),
  };
});

describe('Payment Method Row', () => {
  it('Displays "Default" chip if payment method is set as default', async () => {
    const { getByText } = renderWithTheme(
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
    const { queryByText } = renderWithTheme(
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

    const { getByLabelText } = renderWithTheme(
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

    const { getByLabelText } = renderWithTheme(
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
    const { getByLabelText, getByText } = renderWithTheme(
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
    queryMocks.userPermissions.mockReturnValue({
      data: {
        make_billing_payment: false,
        set_default_payment_method: false,
        delete_payment_method: true,
      },
    });
    const { getByLabelText, getByText } = renderWithTheme(
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
    queryMocks.userPermissions.mockReturnValue({
      data: {
        make_billing_payment: true,
        set_default_payment_method: true,
        delete_payment_method: false,
      },
    });
    const paymentMethod = paymentMethodFactory.build({
      data: {
        card_type: 'Visa',
        last_four: '1111',
      },
      is_default: false,
    });

    const { getByLabelText, getByText } = renderWithTheme(
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

  it('should disable "Make a Payment" button if the user does not have make_billing_payment permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        make_billing_payment: false,
        set_default_payment_method: false,
        delete_payment_method: false,
      },
    });
    const { getByLabelText, getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
        />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    await userEvent.click(actionMenu);

    const makePaymentButton = getByText('Make a Payment');
    expect(makePaymentButton).toBeVisible();
    expect(
      makePaymentButton.closest('li')?.getAttribute('aria-disabled')
    ).toEqual('true');
  });

  it('should enable "Make a Payment" button if the user has make_billing_payment permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        make_billing_payment: true,
        set_default_payment_method: false,
        delete_payment_method: false,
      },
    });
    const { getByLabelText, getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          onDelete={vi.fn()}
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
        />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    await userEvent.click(actionMenu);

    const makePaymentButton = getByText('Make a Payment');
    expect(makePaymentButton).toBeVisible();
    expect(
      makePaymentButton.closest('li')?.getAttribute('aria-disabled')
    ).not.toEqual('true');
  });

  it('Opens "Make a Payment" drawer with the payment method preselected if "Make a Payment" action is clicked', async () => {
    const paymentMethods = [
      paymentMethodFactory.build({
        type: 'paypal',
        data: { email: 'test@linode.com', paypal_id: '' },
      }),
      paymentMethodFactory.build({
        type: 'credit_card',
        data: { last_four: '1881' },
      }),
    ];

    /*
     * The <BillingSummary /> component is responsible for rendering the "Make a Payment" drawer,
     * and is required for this test. We may want to consider decoupling these components in the future.
     */
    const { getByLabelText, getByTestId, getByText, getAllByTestId } =
      renderWithTheme(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <BillingSummary
            balance={0}
            balanceUninvoiced={0}
            paymentMethods={paymentMethods}
          />
          <PaymentMethodRow
            onDelete={vi.fn()}
            paymentMethod={paymentMethods[1]}
          />
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

    await waitFor(() => {
      expect(getByTestId('drawer')).toBeVisible();
    });

    expect(getByTestId('drawer-title')).toHaveTextContent('Make a Payment');

    const expectedSelectionCard = getAllByTestId('selection-card')[1];

    expect(expectedSelectionCard).toBeVisible();
    expect(expectedSelectionCard).toHaveTextContent('1881');
    expect(expectedSelectionCard).toHaveAttribute(
      'data-qa-selection-card-checked',
      'true'
    );

    // In the future, if we have access to the router's state,
    // we can assert the search params.
  });
});
