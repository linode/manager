import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BillingDetail } from './BillingDetail';

vi.mock('@linode/api-v4/lib/account', async () => {
  const actual = await vi.importActual<{}>('@linode/api-v4/lib/account');
  return {
    ...actual,
    getInvoices: vi.fn().mockResolvedValue({
      results: 0,
      page: 1,
      pages: 1,
      data: [],
    }),
    getPaymentMethods: vi.fn().mockResolvedValue({
      results: 0,
      page: 1,
      pages: 1,
      data: [],
    }),
    getPayments: vi.fn().mockResolvedValue({
      results: 0,
      page: 1,
      pages: 1,
      data: [],
    }),
    getAccountInfo: vi.fn().mockResolvedValue([]),
  };
});

describe('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId } = renderWithTheme(<BillingDetail />);

    await findByTestId('billing-detail');
    // Todo: add some get-by-texts once the correct text is available
  });
});
