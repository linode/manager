import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallActionMenu } from './FirewallActionMenu';

import type { FirewallStatus } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: { update_firewall: false, delete_firewall: false },
  })),
  useIsLinodeInterfacesEnabled: vi.fn(() => ({
    data: { isLinodeInterfacesEnabled: false },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/utilities/linodes', () => ({
  useIsLinodeInterfacesEnabled: queryMocks.useIsLinodeInterfacesEnabled,
}));

describe('FirewallActionMenu', () => {
  const defaultProps = {
    firewallID: 1,
    firewallLabel: 'test-firewall',
    firewallStatus: 'enabled' as FirewallStatus,
    isDefaultFirewall: false,
    triggerDeleteFirewall: vi.fn(),
    triggerDisableFirewall: vi.fn(),
    triggerEnableFirewall: vi.fn(),
  };

  it('disables Enable/Disable and Delete actions if user lacks permissions', async () => {
    renderWithTheme(<FirewallActionMenu {...defaultProps} />);

    const menuButton = screen.getByLabelText(/action menu for firewall/i);
    await userEvent.click(menuButton);

    const enableDisable = screen.getByTestId('Disable');
    expect(enableDisable).toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables Enable/Disable and Delete actions if user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_firewall: true, delete_firewall: true },
    });

    renderWithTheme(<FirewallActionMenu {...defaultProps} />);

    const menuButton = screen.getByLabelText(/action menu for firewall/i);
    await userEvent.click(menuButton);

    const enableDisable = screen.getByTestId('Disable');
    expect(enableDisable).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('enables Enable/Disable and disabled Delete actions if user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_firewall: true, delete_firewall: false },
    });

    renderWithTheme(<FirewallActionMenu {...defaultProps} />);

    const menuButton = screen.getByLabelText(/action menu for firewall/i);
    await userEvent.click(menuButton);

    const enableDisable = screen.getByTestId('Disable');
    expect(enableDisable).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
  });
});
