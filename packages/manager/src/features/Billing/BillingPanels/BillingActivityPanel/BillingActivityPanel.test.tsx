import { fireEvent, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';

import { invoiceFactory, paymentFactory } from 'src/factories/billing';
import { renderWithTheme } from 'src/utilities/testHelpers';

import BillingActivityPanel, {
  getCutoffFromDateRange,
  invoiceToActivityFeedItem,
  makeFilter,
  paymentToActivityFeedItem,
} from './BillingActivityPanel';
vi.mock('../../../../utilities/getUserTimezone');

// Mock global Date object so Transaction Date tests are deterministic.
global.Date.now = vi.fn(() => new Date('2020-01-02T00:00:00').getTime());

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/account');
  const invoices = [
    // eslint-disable-next-line
    invoiceFactory.build({ date: '2020-01-01T00:00:00' }),
    // eslint-disable-next-line
    invoiceFactory.build({ date: '2019-12-01T00:00:00' }),
  ];
  const payments = [
    paymentFactory.build({ date: '2020-01-01T00:00:00' }),
    paymentFactory.build({ date: '2019-12-01T00:00:00' }),
  ];

  return {
    ...actual,
    getInvoices: vi.fn().mockResolvedValue({
      data: invoices,
      page: 1,
      pages: 1,
      results: 2,
    }),
    getPayments: vi.fn().mockResolvedValue({
      data: payments,
      page: 1,
      pages: 1,
      results: 2,
    }),
  };
});
vi.mock('src/components/EnhancedSelect/Select');

describe('BillingActivityPanel', () => {
  it('renders the header and appropriate rows', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel />);
    await waitFor(() => {
      getByText('Billing & Payment History');
      getByText('Description');
      getByText('Date');
      getByText('Amount');
    });
  });

  it('renders a row for each payment and invoice', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <BillingActivityPanel />
    );
    await waitFor(() => {
      getByText('Invoice #0');
      getByText('Invoice #1');
      getByTestId(`payment-0`);
      getByTestId(`payment-1`);
    });
  });

  it('should filter by item type', async () => {
    const { queryAllByTestId, queryByTestId, queryByText } = renderWithTheme(
      <BillingActivityPanel />
    );

    // Test selecting "Invoices"
    await waitFor(() => {
      const transactionTypeSelect = queryAllByTestId('select')?.[0];
      fireEvent.change(transactionTypeSelect, {
        target: { value: 'invoice' },
      });
      expect(queryByTestId('payment-0')).toBeFalsy();
    });

    // Test selecting "Payments"
    await waitFor(() => {
      const transactionTypeSelect = queryAllByTestId('select')?.[0];
      fireEvent.change(transactionTypeSelect, {
        target: { value: 'payment' },
      });
      expect(queryByText('Invoice #0')).toBeFalsy();
    });
  });

  it('should filter by transaction date', async () => {
    const { queryAllByTestId, queryByTestId, queryByText } = renderWithTheme(
      <BillingActivityPanel />
    );

    await waitFor(() => {
      const transactionDateSelect = queryAllByTestId('select')?.[1];
      fireEvent.change(transactionDateSelect, {
        target: { value: '30 Days' },
      });
      expect(queryByText('Invoice #1')).toBeFalsy();
      expect(queryByTestId('payment-1')).toBeFalsy();
    });
  });

  it('should display transaction selection components with defaults', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel />);
    await waitFor(() => {
      getByText('All Transaction Types');
      getByText('90 Days');
    });
  });

  it('should display "Account active since"', async () => {
    const { getByText } = renderWithTheme(
      <BillingActivityPanel accountActiveSince="2018-01-01" />
    );
    await waitFor(() => {
      getByText('Account active since 2018-01-01');
    });
  });
});

describe('invoiceToActivityFeedItem', () => {
  it('leaves the label untouched if the total is >= 0', () => {
    const invoice0 = invoiceFactory.build({ label: 'Invoice #100', total: 0 });
    const invoice1 = invoiceFactory.build({ label: 'Invoice #101', total: 1 });
    expect(invoiceToActivityFeedItem(invoice0).label).toBe('Invoice #100');
    expect(invoiceToActivityFeedItem(invoice1).label).toBe('Invoice #101');
  });
});

describe('paymentToActivityFeedItem', () => {
  it('sets label as "Payment" if usd >= 0 ', () => {
    const payment = paymentFactory.build({ id: 1, usd: 0 });
    expect(paymentToActivityFeedItem(payment).label).toBe('Payment #1');
    expect(paymentToActivityFeedItem(payment).label).toBe('Payment #1');
  });

  it('sets label as "Refund" if usd < 0 ', () => {
    const payment = paymentFactory.build({ usd: -1 });
    expect(paymentToActivityFeedItem(payment).label).toBe('Refund');
  });

  it('sets total as absolute value of usd', () => {
    const paymentNegative = paymentFactory.build({ usd: -1 });
    const paymentZero = paymentFactory.build({ usd: 0 });
    const paymentPositive = paymentFactory.build({ usd: 1 });
    expect(paymentToActivityFeedItem(paymentNegative).total).toBe(1);
    expect(paymentToActivityFeedItem(paymentZero).total).toBe(0);
    expect(paymentToActivityFeedItem(paymentPositive).total).toBe(1);
  });

  describe('getCutoffFromDateRange', () => {
    it('returns the datetime of the range relative to given date', () => {
      const testDate = DateTime.fromObject(
        {
          day: 1,
          month: 1,
          year: 2020,
        },
        { zone: 'utc' }
      );
      const testDateISO = testDate.toISO();
      expect(getCutoffFromDateRange('30 Days', testDateISO)).toBe(
        testDate.minus({ days: 30 }).toISO()
      );
      expect(getCutoffFromDateRange('60 Days', testDateISO)).toBe(
        testDate.minus({ days: 60 }).toISO()
      );
      expect(getCutoffFromDateRange('90 Days', testDateISO)).toBe(
        testDate.minus({ days: 90 }).toISO()
      );
      expect(getCutoffFromDateRange('6 Months', testDateISO)).toBe(
        testDate.minus({ months: 6 }).toISO()
      );
      expect(getCutoffFromDateRange('12 Months', testDateISO)).toBe(
        testDate.minus({ months: 12 }).toISO()
      );
      expect(getCutoffFromDateRange('All Time', testDateISO)).toBeUndefined();
    });
  });

  describe('makeFilter', () => {
    const endDate = '2020-01-01T00:00:00';
    it('always includes conditions to order by date desc', () => {
      expect(makeFilter()).toHaveProperty('+order_by', 'date');
      expect(makeFilter()).toHaveProperty('+order', 'desc');
      expect(makeFilter(endDate)).toHaveProperty('+order_by', 'date');
      expect(makeFilter(endDate)).toHaveProperty('+order', 'desc');
    });

    it('includes a date filter only if given an endDate', () => {
      expect(makeFilter()).not.toHaveProperty('date');
      expect(makeFilter(endDate)).toHaveProperty('date', {
        '+gte': '2020-01-01T00:00:00',
      });
    });
  });
});
