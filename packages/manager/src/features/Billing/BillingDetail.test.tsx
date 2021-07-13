import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { invoiceFactory, paymentFactory } from 'src/factories/billing';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { BillingDetail } from './BillingDetail';

jest.mock('@linode/api-v4/lib/account', () => {
  return {
    getInvoices: jest.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: invoiceFactory.buildList(2),
    }),
    getPayments: jest.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: paymentFactory.buildList(2),
    }),
    getAccountInfo: jest.fn().mockResolvedValue([]),
  };
});

describe('Account Landing', () => {
  it('should render', async () => {
    const { getByTestId } = renderWithTheme(
      <BillingDetail
        history={history}
        location={mockLocation}
        match={match}
        setDocs={jest.fn()}
        clearDocs={jest.fn()}
      />
    );
    await waitFor(() => getByTestId('billing-detail'));
    // Todo: add some get-by-texts once the correct text is available
  });
});
