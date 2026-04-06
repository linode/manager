import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallLandingEmptyState } from './FirewallLandingEmptyState';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: { create_firewall: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('FirewallLandingEmptyState', () => {
  it('enables the Create Firewall button if the user has create_firewall permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { create_firewall: true },
    });
    renderWithTheme(
      <FirewallLandingEmptyState openAddFirewallDrawer={vi.fn()} />
    );
    const submitButton = screen.getByTestId('placeholder-button');
    expect(submitButton).toBeEnabled();
  });

  it('disables the Create Firewall button if the user does not have create_firewall permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { create_firewall: false },
    });
    renderWithTheme(
      <FirewallLandingEmptyState openAddFirewallDrawer={vi.fn()} />
    );
    const submitButton = screen.getByTestId('placeholder-button');
    expect(submitButton).toBeDisabled();
  });
});
