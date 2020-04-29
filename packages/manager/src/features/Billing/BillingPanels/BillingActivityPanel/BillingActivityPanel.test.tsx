import { cleanup, wait } from '@testing-library/react';
import * as React from 'react';
import { invoiceFactory, paymentFactory } from 'src/factories/billing';
import { renderWithTheme } from 'src/utilities/testHelpers';
import BillingActivityPanel, {
  invoiceToActivityFeedItem,
  paymentToActivityFeedItem
} from './BillingActivityPanel';

afterEach(cleanup);

jest.mock('linode-js-sdk/lib/account', () => {
  const invoices = invoiceFactory.buildList(2);
  const payments = paymentFactory.buildList(2);

  return {
    getInvoices: jest.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: invoices
    }),
    getPayments: jest.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: payments
    })
  };
});

describe('BillingActivityPanel', () => {
  it('renders the header and appropriate rows', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel />);
    await wait(() => {
      getByText('Activity');
      getByText('Description');
      getByText('Date');
      getByText('Amount');
    });
  });

  it('renders a row for each payment and invoice', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <BillingActivityPanel />
    );
    await wait(() => {
      getByText('Invoice #0');
      getByText('Invoice #1');
      getByTestId(`payment-0`);
      getByTestId(`payment-1`);
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

  it('renames the invoice to "Credit" if < 0', () => {
    const invoice = invoiceFactory.build({ label: 'Invoice #102', total: -1 });
    expect(invoiceToActivityFeedItem(invoice).label).toBe('Credit #102');
  });
});

describe('paymentToActivityFeedItem', () => {
  it('sets label as "Payment" if usd >= 0 ', () => {
    const payment0 = paymentFactory.build({ usd: 0 });
    expect(paymentToActivityFeedItem(payment0).label).toBe('Payment');
    expect(paymentToActivityFeedItem(payment0).label).toBe('Payment');
  });

  it('sets label as "Credit" if usd < 0 ', () => {
    const payment = paymentFactory.build({ usd: -1 });
    expect(paymentToActivityFeedItem(payment).label).toBe('Credit');
  });

  it('sets total as -usd', () => {
    const paymentNegative = paymentFactory.build({ usd: -1 });
    const paymentZero = paymentFactory.build({ usd: 0 });
    const paymentPositive = paymentFactory.build({ usd: 1 });
    expect(paymentToActivityFeedItem(paymentNegative).total).toBe(-1);
    expect(paymentToActivityFeedItem(paymentZero).total).toBe(0);
    expect(paymentToActivityFeedItem(paymentPositive).total).toBe(-1);
  });
});
