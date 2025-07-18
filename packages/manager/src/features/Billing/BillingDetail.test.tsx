import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BillingDetail } from './BillingDetail';

describe('Account Landing', () => {
  it('should render', async () => {
    const { findByTestId, findByText } = renderWithTheme(<BillingDetail />, {
      initialRoute: '/account/billing',
    });
    await findByTestId('billing-detail');
    await findByText('Account Balance');
    await findByText('Promotions');
    await findByText('Accrued Charges');
    await findByText('Billing Contact');
    await findByText('Payment Methods');
    await findByText('Billing & Payment History');
  });
});
