import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferControls } from './TransferControls';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      accept_service_transfer: false,
      create_service_transfer: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('TransferControls', () => {
  it('should disable "Make a Service Transfer" button if the user does not have create_service_transfer permission', async () => {
    const { getByRole } = renderWithTheme(
      <TransferControls permissions={queryMocks.userPermissions().data} />
    );

    const makeServiceTransferBtn = getByRole('button', {
      name: 'Make a Service Transfer',
    });
    expect(makeServiceTransferBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Make a Service Transfer" button if the user has create_service_transfer permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        accept_service_transfer: false,
        create_service_transfer: true,
      },
    });

    const { getByRole } = renderWithTheme(
      <TransferControls permissions={queryMocks.userPermissions().data} />
    );

    const makeServiceTransferBtn = getByRole('button', {
      name: 'Make a Service Transfer',
    });
    expect(makeServiceTransferBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Review Details" button and transfer textfield if the user does not have accept_service_transfer permission', async () => {
    const { getByRole } = renderWithTheme(
      <TransferControls permissions={queryMocks.userPermissions().data} />
    );

    const reviewBtn = getByRole('button', {
      name: 'Review Details',
    });
    expect(reviewBtn).toHaveAttribute('aria-disabled', 'true');
    expect(reviewBtn).toHaveAttribute(
      'data-qa-tooltip',
      'You do not have permission to receive service transfers.'
    );

    const tokenTextfield = getByRole('textbox', {
      name: 'Receive a Service Transfer',
    });
    expect(tokenTextfield).toBeDisabled();
  });

  it('should enable "Review Details" button if the user has accept_service_transfer permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        accept_service_transfer: true,
        create_service_transfer: true,
      },
    });

    const { getByRole, getByPlaceholderText } = renderWithTheme(
      <TransferControls permissions={queryMocks.userPermissions().data} />
    );

    const reviewBtnBeforeInput = getByRole('button', {
      name: 'Review Details',
    });
    expect(reviewBtnBeforeInput).toHaveAttribute(
      'data-qa-tooltip',
      'Enter a service transfer token to review the details and accept the transfer.'
    );
    const input = getByPlaceholderText('Enter a token');
    await userEvent.type(input, 'test-token');

    await waitFor(() => {
      const reviewBtn = getByRole('button', {
        name: 'Review Details',
      });
      expect(reviewBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});
