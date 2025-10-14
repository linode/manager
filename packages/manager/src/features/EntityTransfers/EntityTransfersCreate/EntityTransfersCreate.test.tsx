import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { EntityTransfersCreate } from './EntityTransfersCreate';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_service_transfer: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

beforeAll(() => {
  mockMatchMedia();
});

describe('EntityTransfersCreate', () => {
  it('should not allow create a transfer if user does not have permission', async () => {
    const { findByText, getByText } = renderWithTheme(
      <EntityTransfersCreate />
    );
    await findByText(
      "You don't have permissions to edit this Account. Please contact your account administrator to request the necessary permissions."
    );

    const text = getByText('Service Transfer Summary');
    expect(text).toBeInTheDocument();

    const generateTokenBtn = getByText('Generate Token');
    expect(generateTokenBtn).toBeInTheDocument();

    expect(generateTokenBtn).toBeDisabled();
  });

  it('should allow to create a transfer if user has create_service_transfer permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_service_transfer: true,
      },
    });

    const { getByText, getByRole } = renderWithTheme(<EntityTransfersCreate />);

    const checkbox = getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    const generateTokenBtn = getByText('Generate Token');
    expect(generateTokenBtn).toBeInTheDocument();

    expect(generateTokenBtn).toBeEnabled();
  });
});
