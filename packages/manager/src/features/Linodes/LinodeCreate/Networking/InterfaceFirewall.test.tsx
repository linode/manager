import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { InterfaceFirewall } from './InterfaceFirewall';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
      create_firewall: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('InterfaceFirewall', () => {
  it('should disable a Firewall select if the user does not have create_linode permission', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <InterfaceFirewall index={0} />,
    });

    const firewallSelect = getByLabelText('Public Interface Firewall');

    expect(firewallSelect).toBeVisible();
    expect(firewallSelect).toBeDisabled();
  });

  it('should disable a "Create Firewall" button if the user does not have create_firewall permission', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <InterfaceFirewall index={0} />,
    });

    const createFirewallButton = getByText('Create Firewall');

    expect(createFirewallButton).toBeVisible();
    expect(createFirewallButton).toBeDisabled();
  });

  it('should enable a Firewall select if the user has create_linode permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        create_firewall: true,
      },
    });
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <InterfaceFirewall index={0} />,
    });

    const firewallSelect = getByLabelText('Public Interface Firewall');

    expect(firewallSelect).toBeVisible();
    expect(firewallSelect).toBeEnabled();
  });

  it('should enable a "Create Firewall" button if the user has create_firewall permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        create_firewall: true,
      },
    });
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <InterfaceFirewall index={0} />,
    });

    const createFirewallButton = getByText('Create Firewall');

    expect(createFirewallButton).toBeVisible();
    expect(createFirewallButton).toBeEnabled();
  });
});
