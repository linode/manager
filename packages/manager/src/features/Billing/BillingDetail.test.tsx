import { act, cleanup } from '@testing-library/react';
import * as React from 'react';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BillingDetail } from './BillingDetail';

afterEach(cleanup);

jest.mock('linode-js-sdk/lib/account', () => {
  return {
    getAccountInfo: jest.fn().mockResolvedValue([]),
    getInvoices: jest.fn().mockResolvedValue([]),
    getPayments: jest.fn().mockResolvedValue([])
  };
});

describe('Account Landing', () => {
  it('should render', async () => {
    await act(async () => {
      const { getByTestId } = renderWithTheme(
        <BillingDetail
          history={history}
          location={mockLocation}
          match={match}
          setDocs={jest.fn()}
          clearDocs={jest.fn()}
        />
      );
      getByTestId('billing-detail');
      // Todo: add some get-by-texts once the correct text is available
    });
  });
});
