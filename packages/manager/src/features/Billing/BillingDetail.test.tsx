import { vi } from 'vitest';
import * as React from 'react';
import { paymentMethodFactory } from 'src/factories';
import { invoiceFactory, paymentFactory } from 'src/factories/billing';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { BillingDetail } from './BillingDetail';

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<{}>('@linode/api-v4/lib/account');
  return {
    ...actual,
    getInvoices: vi.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: invoiceFactory.buildList(2),
    }),
    getPaymentMethods: vi.fn().mockResolvedValue({
      results: 1,
      page: 1,
      pages: 1,
      data: paymentMethodFactory.buildList(1),
    }),
    getPayments: vi.fn().mockResolvedValue({
      results: 2,
      page: 1,
      pages: 1,
      data: paymentFactory.buildList(2),
    }),
    getAccountInfo: vi.fn().mockResolvedValue([]),
  };
});

describe('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId } = renderWithTheme(
      <BillingDetail
        history={history}
        location={mockLocation}
        match={match}
        setDocs={vi.fn()}
        clearDocs={vi.fn()}
      />
    );
    await findByTestId('billing-detail');
    // Todo: add some get-by-texts once the correct text is available
  });
});
