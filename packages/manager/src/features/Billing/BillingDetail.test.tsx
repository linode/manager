import * as React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BillingDetail } from './BillingDetail';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      list_billing_payments: true,
    },
  })),
  useAccount: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Billing Detail', () => {
  it('should render', async () => {
    const account = accountFactory.build({});

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const { findByTestId, findByText } = renderWithTheme(<BillingDetail />, {
      initialRoute: '/billing',
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
