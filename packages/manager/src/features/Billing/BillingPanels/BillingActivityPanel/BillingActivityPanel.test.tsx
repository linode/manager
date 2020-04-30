import { cleanup, fireEvent, wait } from '@testing-library/react';
import * as React from 'react';
import { invoiceFactory, paymentFactory } from 'src/factories/billing';
import { renderWithTheme } from 'src/utilities/testHelpers';
import BillingActivityPanel, {
  invoiceToActivityFeedItem,
  paymentToActivityFeedItem,
  BillingActivityPanelProps
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
jest.mock('src/components/EnhancedSelect/Select');

const mockOpenCloseAccountDialog = jest.fn();

const props: BillingActivityPanelProps = {
  isRestrictedUser: false,
  openCloseAccountDialog: mockOpenCloseAccountDialog,
  accountActiveSince: '2018-01-01T00:00:00'
};

describe('BillingActivityPanel', () => {
  it('renders the header and appropriate rows', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel {...props} />);
    await wait(() => {
      getByText('Billing & Payment History');
      getByText('Description');
      getByText('Date');
      getByText('Amount');
    });
  });

  it('renders a row for each payment and invoice', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <BillingActivityPanel {...props} />
    );
    await wait(() => {
      getByText('Invoice #0');
      getByText('Invoice #1');
      getByTestId(`payment-0`);
      getByTestId(`payment-1`);
    });
  });

  it.only('should filter by item type', async () => {
    const { queryAllByTestId, queryByText, queryByTestId } = renderWithTheme(
      <BillingActivityPanel {...props} />
    );

    // Test selecting "Invoices"
    await wait(() => {
      const transactionTypeSelect = queryAllByTestId('select')?.[0];
      fireEvent.change(transactionTypeSelect, {
        target: { value: 'invoice' }
      });
      expect(queryByTestId('payment-0')).toBeFalsy();
    });

    // Test selecting "Payments"
    await wait(() => {
      const transactionTypeSelect = queryAllByTestId('select')?.[0];
      fireEvent.change(transactionTypeSelect, {
        target: { value: 'payment' }
      });
      expect(queryByText('Invoice #0')).toBeFalsy();
    });
  });

  it('should display "Account active since"', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel {...props} />);
    await wait(() => {
      getByText('Account active since 2018-01-01');
    });
  });

  it('should display "Close Account" button if unrestricted', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel {...props} />);
    await wait(() => {
      const closeAccountButton = getByText('Close Account');
      fireEvent.click(closeAccountButton);
      expect(mockOpenCloseAccountDialog).toHaveBeenCalled();
    });
  });

  it('should not display "Close Account" button if restricted', async () => {
    const { queryByText } = renderWithTheme(
      <BillingActivityPanel {...props} isRestrictedUser={true} />
    );
    await wait(() => {
      expect(queryByText('Close Account')).toBeFalsy();
    });
  });

  it('should display transaction selection components with defaults', async () => {
    const { getByText } = renderWithTheme(<BillingActivityPanel {...props} />);
    await wait(() => {
      getByText('All Transaction Types');
      getByText('90 Days');
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

  it('sets label as "Refund to Card" if usd < 0 ', () => {
    const payment = paymentFactory.build({ usd: -1 });
    expect(paymentToActivityFeedItem(payment).label).toBe('Refund to Card');
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
