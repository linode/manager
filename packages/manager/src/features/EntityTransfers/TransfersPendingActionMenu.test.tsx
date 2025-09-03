import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransfersPendingActionMenu } from './TransfersPendingActionMenu';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      cancel_service_transfer: false,
      accept_service_transfer: false,
      create_service_transfer: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

const props = {
  onCancelClick: vi.fn(),
  permissions: queryMocks.userPermissions().data,
};

describe('TransfersPendingActionMenu', () => {
  it('should disable "Cancel" button if the user does not have cancel_service_transfer permission', async () => {
    const { getByRole } = renderWithTheme(
      <TransfersPendingActionMenu {...props} />
    );

    const cancelBtn = getByRole('button', {
      name: 'Cancel',
    });
    expect(cancelBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Cancel" button if the user has cancel_service_transfer permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        cancel_service_transfer: true,
        accept_service_transfer: false,
        create_service_transfer: false,
      },
    });

    const { getByRole } = renderWithTheme(
      <TransfersPendingActionMenu
        {...props}
        permissions={queryMocks.userPermissions().data}
      />
    );

    const cancelBtn = getByRole('button', {
      name: 'Cancel',
    });
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
