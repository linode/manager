import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { BillingDetail } from './BillingDetail';

describe('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId, findByText } = await renderWithThemeAndRouter(
      <BillingDetail />
    );
    await findByTestId('billing-detail');
    await findByText('Account Balance');
    await findByText('Promotions');
    await findByText('Accrued Charges');
    await findByText('Billing Contact');
    await findByText('Payment Methods');
    await findByText('Billing & Payment History');
  });
});
