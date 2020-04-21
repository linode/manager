import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BillingDetail } from './BillingDetail';

afterEach(cleanup);

const request = require.requireMock('linode-js-sdk/lib/account');
jest.mock('linode-js-sdk/lib/account');
request.getAccountInfo = jest.fn().mockResolvedValue([]);
request.getInvoices = jest.fn().mockResolvedValue([]);

describe('Account Landing', () => {
  const { getByTestId } = renderWithTheme(
    <BillingDetail
      history={history}
      location={mockLocation}
      match={match}
      setDocs={jest.fn()}
      clearDocs={jest.fn()}
    />
  );

  it('should render', () => {
    getByTestId('billing-detail');
    // Todo: add some get-by-texts once the correct text is available
  });
});
