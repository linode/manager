import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BillingDetail } from './BillingDetail';

describe('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId } = renderWithTheme(<BillingDetail />);
    await findByTestId('billing-detail');
    // Todo: add some get-by-texts once the correct text is available
  });
});
