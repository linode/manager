import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { BillingDetail } from './BillingDetail';

describe.skip('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId } = renderWithTheme(
      <BillingDetail
        history={history}
        location={mockLocation}
        match={match}
        setDocs={jest.fn()}
        clearDocs={jest.fn()}
      />
    );
    await findByTestId('billing-detail');
    // Todo: add some get-by-texts once the correct text is available
  });
});
