import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { paymentMethodFactory } from 'src/factories';
import BillingSummary from 'src/features/Billing/BillingPanels/BillingSummary';
import { renderWithTheme } from 'src/utilities/testHelpers';
import PaymentMethodRow from './PaymentMethodRow';

jest.mock('@linode/api-v4/lib/account', () => {
  return {
    makeDefaultPaymentMethod: jest.fn().mockResolvedValue({}),
    getClientToken: jest.fn().mockResolvedValue('mockedBraintreeClientToken'),
  };
});

describe('Payment Method Row', () => {
  it('Displays "Default" chip if payment method is set as default', () => {
    const { getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
          onDelete={jest.fn()}
        />
      </PayPalScriptProvider>
    );

    expect(getByText('DEFAULT')).toBeVisible();
  });

  it('Does not display "Default" chip if payment method is not set as default', () => {
    const { queryByText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={paymentMethodFactory.build({ is_default: false })}
          onDelete={jest.fn()}
        />
      </PayPalScriptProvider>
    );

    expect(queryByText('DEFAULT')).toBeNull();
  });

  it('Has default ARIA label for credit card and Google Pay payment methods', () => {
    const expectedLabelCreditCard = 'Action menu for card ending in 1881';
    const expectedLabelGooglePay = 'Action menu for card ending in 1111';

    const paymentMethodCreditCard = paymentMethodFactory.build({
      is_default: false,
      data: {
        card_type: 'Visa',
        last_four: '1881',
        expiry: '12/2022',
      },
      type: 'credit_card',
    });

    const paymentMethodGooglePay = paymentMethodFactory.build({
      is_default: false,
      data: {
        card_type: 'Visa',
        last_four: '1111',
        expiry: '12/2022',
      },
      type: 'google_pay',
    });

    const { getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={paymentMethodCreditCard}
          onDelete={jest.fn()}
        />
        <PaymentMethodRow
          paymentMethod={paymentMethodGooglePay}
          onDelete={jest.fn()}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText(expectedLabelCreditCard)).toBeVisible();
    expect(getByLabelText(expectedLabelGooglePay)).toBeVisible();
  });

  it('Has PayPal-specific ARIA label for PayPal payment methods', () => {
    const expectedLabelPayPal =
      'Action menu for Paypal testpaypaluser@example.com';
    const payPalPaymentMethod = paymentMethodFactory.build({
      is_default: false,
      data: {
        paypal_id: '123456',
        email: 'testpaypaluser@example.com',
      },
      type: 'paypal',
    });

    const { getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={payPalPaymentMethod}
          onDelete={jest.fn()}
        />
      </PayPalScriptProvider>
    );

    expect(getByLabelText(expectedLabelPayPal)).toBeVisible();
  });

  it('Disables "Make Default" and "Delete" actions if payment method is set as default', () => {
    const { getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={paymentMethodFactory.build({ is_default: true })}
          onDelete={jest.fn()}
        />
      </PayPalScriptProvider>
    );

    expect(getByText('Make Default').getAttribute('aria-disabled')).toEqual(
      'true'
    );
    expect(getByText('Delete').getAttribute('aria-disabled')).toEqual('true');
  });

  it('Calls `onDelete` callback when "Delete" action is clicked', () => {
    const mockFunction = jest.fn();

    const { getByText, getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow
          paymentMethod={paymentMethodFactory.build({ is_default: false })}
          onDelete={mockFunction}
        />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    userEvent.click(actionMenu);

    const deleteActionButton = getByText('Delete');
    expect(deleteActionButton).toBeVisible();
    userEvent.click(deleteActionButton);

    expect(mockFunction).toBeCalledTimes(1);
  });

  it('Makes payment method default when "Make Default" action is clicked', () => {
    const paymentMethod = paymentMethodFactory.build({
      is_default: false,
      data: {
        card_type: 'Visa',
        last_four: '1111',
      },
    });

    const { getByText, getByLabelText } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <PaymentMethodRow paymentMethod={paymentMethod} onDelete={jest.fn()} />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1111');
    userEvent.click(actionMenu);

    const makeDefaultButton = getByText('Make Default');
    expect(makeDefaultButton).toBeVisible();
    userEvent.click(makeDefaultButton);

    expect(makeDefaultPaymentMethod).toBeCalledTimes(1);
  });

  it('Opens "Make a Payment" drawer if "Make a Payment" action is clicked', () => {
    const paymentMethod = paymentMethodFactory.build();

    /*
     * The <BillingSummary /> component is responsible for rendering the "Make a Payment" drawer,
     * and is required for this test. We may want to consider decoupling these components in the future.
     */
    const { getByText, getByLabelText, getByTestId } = renderWithTheme(
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
        <BillingSummary
          paymentMethods={[paymentMethod]}
          balanceUninvoiced={0}
          balance={0}
        />
        <PaymentMethodRow paymentMethod={paymentMethod} onDelete={jest.fn()} />
      </PayPalScriptProvider>
    );

    const actionMenu = getByLabelText('Action menu for card ending in 1881');
    userEvent.click(actionMenu);

    const makePaymentButton = getByText('Make a Payment');
    expect(makePaymentButton).toBeVisible();
    userEvent.click(makePaymentButton);

    expect(getByTestId('drawer')).toBeVisible();
    expect(getByTestId('drawer-title').textContent).toEqual('Make a Payment');
  });
});
