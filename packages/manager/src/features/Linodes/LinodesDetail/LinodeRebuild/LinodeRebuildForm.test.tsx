import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeRebuildForm } from './LinodeRebuildForm';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      rebuild_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('LinodeRebuildForm', () => {
  it('renders a notice reccomending users add user data when the Linode already uses user data', async () => {
    const linode = linodeFactory.build({ has_user_data: true });

    const { getByText } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    expect(
      getByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeVisible();
  });

  it('disables the "reuse existing user data" checkbox if the Linode does not have existing user data', async () => {
    const linode = linodeFactory.build({ has_user_data: false });

    const { getByText, getByLabelText, queryByText } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    // Open the "Add User Data" accordion
    await userEvent.click(getByText('Add User Data'));

    // Verify the reccomendation is not present because the Linode does not use metadata currently
    expect(
      queryByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeNull();

    const checkbox = getByLabelText(
      `Reuse user data previously provided for ${linode.label}`
    );

    expect(checkbox).toBeDisabled();

    expect(
      getByLabelText('This Linode does not have existing user data.')
    ).toBeVisible();
  });

  it('should disable all fields if user does not have permission', async () => {
    const linode = linodeFactory.build();

    const { getByRole, getByPlaceholderText, getAllByRole } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    const passwordInput = getByPlaceholderText('Enter a password.');
    expect(passwordInput).toBeDisabled();

    const rebuildBtn = getByRole('button', {
      name: 'Rebuild Linode',
    });
    expect(rebuildBtn).toHaveAttribute('aria-disabled', 'true');

    const rebuildInput = getAllByRole('combobox')[0];
    expect(rebuildInput).toBeDisabled();
  });

  it('should enable all fields if user has permission', async () => {
    const linode = linodeFactory.build();

    queryMocks.userPermissions.mockReturnValue({
      data: {
        rebuild_linode: true,
      },
    });

    const { getByRole, getByPlaceholderText, getAllByRole } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    const passwordInput = getByPlaceholderText('Enter a password.');
    expect(passwordInput).toBeEnabled();

    const rebuildBtn = getByRole('button', {
      name: 'Rebuild Linode',
    });
    expect(rebuildBtn).not.toHaveAttribute('aria-disabled', 'true');

    const rebuildInput = getAllByRole('combobox')[0];
    expect(rebuildInput).toBeEnabled();
  });
});
