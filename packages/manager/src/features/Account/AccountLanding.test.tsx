import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccountLanding } from './AccountLanding';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: { make_billing_payment: false },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('AccountLanding', () => {
  it('should disable "Make a Payment" button if the user does not have make_billing_payment permission', async () => {
    const { getByRole } = renderWithTheme(<AccountLanding />);

    const addTagBtn = getByRole('button', {
      name: 'Make a Payment',
    });
    expect(addTagBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Make a Payment" button if the user has make_billing_payment permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { make_billing_payment: true },
    });

    const { getByRole } = renderWithTheme(<AccountLanding />);

    const addTagBtn = getByRole('button', {
      name: 'Make a Payment',
    });
    expect(addTagBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
