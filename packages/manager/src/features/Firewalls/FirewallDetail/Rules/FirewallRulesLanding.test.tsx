import React from 'react';

import { firewallRulesFactory } from 'src/factories/firewalls';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallRulesLanding } from './FirewallRulesLanding';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_firewall_rules: false,
    },
  })),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useBlocker: vi.fn(() => ({
    proceed: vi.fn(),
    reset: vi.fn(),
    status: 'unblocked',
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useLocation: vi.fn(() => ({
      pathname: '/firewalls/1/rules',
    })),
    useBlocker: queryMocks.useBlocker,
  };
});

const firewallRules = firewallRulesFactory.build();
const getDisabledState = () =>
  !queryMocks.userPermissions().data.update_firewall_rules;

describe('FirewallRuleTable', () => {
  it('should disable "Add AN Inbound Rule" button if the user does not have update_firewall_rules permission', () => {
    const { getByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const addInboundBtn = getByRole('button', { name: 'Add an Inbound Rule' });

    expect(addInboundBtn).toBeInTheDocument();
    expect(addInboundBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Add AN Outbound Rule" button if the user does not have update_firewall_rules permission', () => {
    const { getByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const addOutboundBtn = getByRole('button', {
      name: 'Add an Outbound Rule',
    });
    expect(addOutboundBtn).toBeInTheDocument();
    expect(addOutboundBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Save Changes" button if the user does not have update_firewall_rules permission', () => {
    const { getByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const saveBtn = getByRole('button', { name: 'Save Changes' });

    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable menu buttons if the user does not have update_firewall_rules permission', () => {
    const { getAllByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const editBtns = getAllByRole('button', {
      name: 'Edit',
    });
    expect(editBtns[0]).toBeVisible();
    expect(editBtns[0]).toHaveAttribute('aria-disabled', 'true');

    const cloneBtns = getAllByRole('button', {
      name: 'Clone',
    });
    expect(cloneBtns[0]).toBeVisible();
    expect(cloneBtns[0]).toHaveAttribute('aria-disabled', 'true');

    const deleteBtns = getAllByRole('button', {
      name: 'Delete',
    });
    expect(deleteBtns[0]).toBeVisible();
    expect(deleteBtns[0]).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable menu buttons if the user has update_firewall_rules permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_firewall_rules: true,
      },
    });
    const { getAllByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const editBtns = getAllByRole('button', {
      name: 'Edit',
    });
    expect(editBtns[0]).toBeVisible();
    expect(editBtns[0]).not.toHaveAttribute('aria-disabled', 'true');

    const cloneBtns = getAllByRole('button', {
      name: 'Clone',
    });
    expect(cloneBtns[0]).toBeVisible();
    expect(cloneBtns[0]).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtns = getAllByRole('button', {
      name: 'Delete',
    });
    expect(deleteBtns[0]).toBeVisible();
    expect(deleteBtns[0]).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add AN Inbound Rule" button if the user has update_firewall_rules permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_firewall_rules: true,
      },
    });
    const { getByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const addInboundBtn = getByRole('button', { name: 'Add an Inbound Rule' });

    expect(addInboundBtn).toBeInTheDocument();
    expect(addInboundBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add AN Outbound Rule" button if the user has update_firewall_rules permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_firewall_rules: true,
      },
    });
    const { getByRole } = renderWithTheme(
      <FirewallRulesLanding
        disabled={getDisabledState()}
        firewallID={1}
        rules={firewallRules}
      />
    );

    const addOutboundBtn = getByRole('button', {
      name: 'Add an Outbound Rule',
    });
    expect(addOutboundBtn).toBeInTheDocument();
    expect(addOutboundBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
