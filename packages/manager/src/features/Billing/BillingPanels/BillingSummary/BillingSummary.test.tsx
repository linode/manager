import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { promoFactory } from 'src/factories';
import {
  renderWithTheme,
  withMarkup,
  wrapWithTheme,
} from 'src/utilities/testHelpers';

import BillingSummary from './BillingSummary';

const accountBalanceText = 'account-balance-text';
const accountBalanceValue = 'account-balance-value';

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/account');
  return {
    ...actual,
    getClientToken: vi.fn().mockResolvedValue('mockedBraintreeClientToken'),
  };
});

describe('BillingSummary', () => {
  it('displays appropriate helper text and value when there is no balance', () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/no balance/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$0.00');
  });

  it('displays a credit when there is a negative balance', () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={-10}
          balanceUninvoiced={5}
          paymentMethods={[]}
        />
      </PayPalScriptProvider>
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/credit/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('displays the balance when there is a positive balance that is not yet past due', () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={10}
          balanceUninvoiced={5}
          paymentMethods={[]}
        />
      </PayPalScriptProvider>
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/Balance/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('does not display the promotions section unless there are promos', async () => {
    const { rerender } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>
    );
    expect(screen.queryByText('Promotions')).not.toBeInTheDocument();
    rerender(
      wrapWithTheme(
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
          <BillingSummary
            balance={0}
            balanceUninvoiced={5}
            paymentMethods={[]}
            promotions={promoFactory.buildList(1)}
          />
        </PayPalScriptProvider>
      )
    );
    expect(screen.getByText('Promotions'));
  });

  it('renders promo summary, expiry, and credit remaining', () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={0}
          balanceUninvoiced={5}
          paymentMethods={[]}
          promotions={promoFactory.buildList(1, {
            credit_monthly_cap: '20.00',
            credit_remaining: '15.50',
            expire_dt: '2020-01-01T12:00:00',
            summary: 'MY_PROMO_CODE',
          })}
        />
      </PayPalScriptProvider>
    );
    const getByTextWithMarkup = withMarkup(screen.getByText);
    screen.getByText('MY_PROMO_CODE');
    getByTextWithMarkup('$15.50 remaining');
    getByTextWithMarkup('Expires: 2020-01-01');
    getByTextWithMarkup('Monthly cap: $20.00');
  });

  it('displays promo service type unless the service type is all', () => {
    const promotions = [
      promoFactory.build(),
      promoFactory.build({ service_type: 'linode', summary: 'MY_PROMO_CODE' }),
    ];
    renderWithTheme(
      <BillingSummary
        balance={0}
        balanceUninvoiced={5}
        paymentMethods={[]}
        promotions={promotions}
      />
    );
    expect(screen.queryByText('Applies to: All')).not.toBeInTheDocument();
    expect(screen.getByText('Applies to: Linodes'));
  });

  it('displays accrued charges', () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>
    );
    within(screen.getByTestId('accrued-charges-value')).getByText('$5.00');
  });

  it('opens "Make a Payment" drawer when "Make a payment." is clicked', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={5} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>
    );

    const paymentButton = getByText('Make a payment', { exact: false });
    await userEvent.click(paymentButton);

    expect(getByTestId('drawer')).toBeVisible();
    expect(getByTestId('drawer-title').textContent).toEqual('Make a Payment');
  });
});
