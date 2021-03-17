import { screen, within } from '@testing-library/react';
import * as React from 'react';
import { promoFactory } from 'src/factories';
import {
  renderWithTheme,
  withMarkup,
  wrapWithTheme,
} from 'src/utilities/testHelpers';
import BillingSummary from './BillingSummary';

const accountBalanceText = 'account-balance-text';
const accountBalanceValue = 'account-balance-value';

describe('BillingSummary', () => {
  it('displays appropriate helper text and value when there is no balance', () => {
    renderWithTheme(<BillingSummary balance={0} balanceUninvoiced={5} />);
    within(screen.getByTestId(accountBalanceText)).getByText(/no balance/gi);
    within(screen.getByTestId(accountBalanceValue)).getByText('$0.00');
  });

  it('displays a credit when there is a negative balance', () => {
    renderWithTheme(<BillingSummary balance={-10} balanceUninvoiced={5} />);
    within(screen.getByTestId(accountBalanceText)).getByText(/credit/gi);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('displays an overdue payment notice when there is a positive balance', () => {
    renderWithTheme(<BillingSummary balance={10} balanceUninvoiced={5} />);
    within(screen.getByTestId(accountBalanceText)).getByText(/payment due/gi);
    within(screen.getByTestId(accountBalanceValue)).getByText('$10.00');
  });

  it('does not display the promotions section unless there are promos', async () => {
    const { rerender } = renderWithTheme(
      <BillingSummary balance={0} balanceUninvoiced={5} />
    );
    expect(screen.queryByText('Promotions')).not.toBeInTheDocument();
    rerender(
      wrapWithTheme(
        <BillingSummary
          balance={0}
          balanceUninvoiced={5}
          promotions={promoFactory.buildList(1)}
        />
      )
    );
    expect(screen.getByText('Promotions'));
  });

  it('renders promo summary, expiry, and credit remaining', () => {
    renderWithTheme(
      <BillingSummary
        balance={0}
        balanceUninvoiced={5}
        promotions={promoFactory.buildList(1, {
          summary: 'MY_PROMO_CODE',
          credit_remaining: '15.50',
          expire_dt: '2020-01-01T12:00:00',
          credit_monthly_cap: '20.00',
        })}
      />
    );
    const getByTextWithMarkup = withMarkup(screen.getByText);
    screen.getByText('MY_PROMO_CODE');
    getByTextWithMarkup('$15.50 remaining');
    getByTextWithMarkup('Expires: 2020-01-01');
    getByTextWithMarkup('Monthly cap: $20.00');
  });

  it('displays accrued charges', () => {
    renderWithTheme(<BillingSummary balance={0} balanceUninvoiced={5} />);
    within(screen.getByTestId('accrued-charges-value')).getByText('$5.00');
  });
});
