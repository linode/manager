import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { LinodeRebuildForm } from './LinodeRebuildForm';

const queryMocks = vi.hoisted(() => ({
  useIsPrivateImageSharingEnabled: vi.fn(() => ({
    isPrivateImageSharingEnabled: false,
  })),
  userPermissions: vi.fn(() => ({
    data: {
      rebuild_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/features/Images/utils', async () => {
  const actual = await vi.importActual('src/features/Images/utils');
  return {
    ...actual,
    useIsPrivateImageSharingEnabled: queryMocks.useIsPrivateImageSharingEnabled,
  };
});

describe('LinodeRebuildForm', () => {
  it('renders a notice recommending users add user data when the Linode already uses user data', async () => {
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

    // Verify the recommendation is not present because the Linode does not use metadata currently
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

  it('should not display fields related to the Image select table when isPrivateImageSharingEnabled is false', () => {
    const linode = linodeFactory.build();

    const { queryByPlaceholderText, queryByRole } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    expect(queryByPlaceholderText('Search images')).not.toBeInTheDocument();
    expect(queryByPlaceholderText('Filter by tag')).not.toBeInTheDocument();
    expect(queryByPlaceholderText('Filter by region')).not.toBeInTheDocument();

    expect(
      queryByRole('columnheader', { name: 'Image' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Replicated in' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Share Group' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Size' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Created' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Image ID' })
    ).not.toBeInTheDocument();
  });

  describe('when isPrivateImageSharingEnabled is true', () => {
    beforeEach(() => {
      queryMocks.useIsPrivateImageSharingEnabled.mockReturnValue({
        isPrivateImageSharingEnabled: true,
      });
      // Mock matchMedia at a width wider than MUI's `lg` breakpoint (1200px)
      // so that columns wrapped in <Hidden lgDown> are not hidden.
      resizeScreenSize(1280);
    });

    it('renders the Search Images field', () => {
      const linode = linodeFactory.build();

      const { getByPlaceholderText } = renderWithTheme(
        <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
      );

      expect(getByPlaceholderText('Search images')).toBeVisible();
    });

    it('renders the Filter by Tag field', () => {
      const linode = linodeFactory.build();

      const { getByPlaceholderText } = renderWithTheme(
        <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
      );

      expect(getByPlaceholderText('Filter by tag')).toBeVisible();
    });

    it('renders the Filter by Region field', () => {
      const linode = linodeFactory.build();

      const { getByPlaceholderText } = renderWithTheme(
        <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
      );

      expect(getByPlaceholderText('Filter by region')).toBeVisible();
    });

    it('renders the table column headers for the Image select table', () => {
      const linode = linodeFactory.build();

      const { getByText } = renderWithTheme(
        <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
      );

      expect(getByText('Image')).toBeVisible();
      expect(getByText('Replicated in')).toBeVisible();
      expect(getByText('Share Group')).toBeVisible();
      expect(getByText('Size')).toBeVisible();
      expect(getByText('Created')).toBeVisible();
      expect(getByText('Image ID')).toBeVisible();
    });
  });
});
