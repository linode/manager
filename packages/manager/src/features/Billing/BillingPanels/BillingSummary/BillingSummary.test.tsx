import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PAYPAL_CLIENT_ID } from 'src/constants';
import { promoFactory } from 'src/factories';
import { renderWithTheme, withMarkup } from 'src/utilities/testHelpers';

import BillingSummary from './BillingSummary';

const accountBalanceText = 'account-balance-text';
const accountBalanceValue = 'account-balance-value';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_promo_code: false,
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
  };
});

describe('BillingSummary', () => {
  it('displays appropriate helper text and value when there is no balance', async () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/no balance/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$0.00');
  });

  it('displays a credit when there is a negative balance', async () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={-10}
          balanceUninvoiced={5}
          paymentMethods={[]}
        />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/credit/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('displays the balance when there is a positive balance that is not yet past due', async () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={10}
          balanceUninvoiced={5}
          paymentMethods={[]}
        />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    within(screen.getByTestId(accountBalanceText)).getByText(/Balance/i);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('does not display the promotions section unless there are promos', async () => {
    const { rerender } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    expect(screen.queryByText('Promotions')).not.toBeInTheDocument();
    rerender(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={0}
          balanceUninvoiced={5}
          paymentMethods={[]}
          promotions={promoFactory.buildList(1)}
        />
      </PayPalScriptProvider>
    );
    expect(screen.getByText('Promotions'));
  });

  it('renders promo summary, expiry, and credit remaining', async () => {
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
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    const getByTextWithMarkup = withMarkup(screen.getByText);
    screen.getByText('MY_PROMO_CODE');
    getByTextWithMarkup('$15.50 remaining');
    getByTextWithMarkup('Expires: 2020-01-01');
    getByTextWithMarkup('Monthly cap: $20.00');
  });

  it('displays promo service type unless the service type is all', async () => {
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
      />,
      {
        initialRoute: '/account/billing',
      }
    );
    expect(screen.queryByText('Applies to: All')).not.toBeInTheDocument();
    expect(screen.getByText('Applies to: Linodes'));
  });

  it('displays accrued charges', async () => {
    renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={0} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    within(screen.getByTestId('accrued-charges-value')).getByText('$5.00');
  });

  it('opens "Make a Payment" drawer when "Make a payment." is clicked', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={5} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );

    const paymentButton = getByText('Make a payment', { exact: false });
    await userEvent.click(paymentButton);

    expect(getByTestId('drawer')).toBeVisible();
    expect(getByTestId('drawer-title').textContent).toEqual('Make a Payment');
  });

  it('does not display the "Add a promo code" button if user does not have create_promo_code permission', async () => {
    const { queryByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary balance={5} balanceUninvoiced={5} paymentMethods={[]} />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    expect(queryByText('Add a promo code')).not.toBeInTheDocument();
  });

  it('displays the "Add a promo code" button if user has create_promo_code permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_promo_code: true,
      },
    });
    const { queryByText } = renderWithTheme(
      <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
        <BillingSummary
          balance={-10}
          balanceUninvoiced={5}
          paymentMethods={[]}
          promotions={[]}
        />
      </PayPalScriptProvider>,
      {
        initialRoute: '/account/billing',
      }
    );
    expect(queryByText('Add a promo code')).toBeInTheDocument();
  });
});
