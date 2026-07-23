import { queryClientFactory } from '@linode/queries';
import { screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PrimaryNav from './PrimaryNav';

import type { Flags } from 'src/featureFlags';

const props = {
  closeMenu: vi.fn(),
  desktopMenuToggle: vi.fn(),
  isCollapsed: false,
  toggleSpacing: vi.fn(),
  toggleTheme: vi.fn(),
};

const queryClient = queryClientFactory();
const queryString = 'menu-item-Managed';

const queryMocks = vi.hoisted(() => ({
  useIsIAMEnabled: vi.fn(() => ({
    isIAMEnabled: false,
  })),
  usePreferences: vi.fn().mockReturnValue({}),
  useAccount: vi.fn().mockReturnValue({}),
  useAccountSettings: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', () => ({
  useIsIAMEnabled: queryMocks.useIsIAMEnabled,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
    useAccount: queryMocks.useAccount,
    useAccountSettings: queryMocks.useAccountSettings,
  };
});

describe('PrimaryNav', () => {
  beforeEach(() => {
    queryMocks.usePreferences.mockReturnValue({
      data: {
        collapsedSideNavProductFamilies: [],
      },
      isLoading: false,
      error: null,
    });
  });

  it('only contains a "Managed" menu link if the user has Managed services.', async () => {
    queryMocks.useAccountSettings.mockReturnValue({
      data: {
        managed: false,
      },
      isLoading: false,
      error: null,
    });

    const { findByTestId, getByTestId, queryByTestId, rerender } =
      renderWithTheme(<PrimaryNav {...props} />, { queryClient });
    expect(queryByTestId(queryString)).not.toBeInTheDocument();

    queryMocks.useAccountSettings.mockReturnValue({
      data: {
        managed: true,
      },
      isLoading: false,
      error: null,
    });

    rerender(wrapWithTheme(<PrimaryNav {...props} />, { queryClient }));

    await findByTestId(queryString);

    getByTestId(queryString);
  });

  it('should have aria-current attribute for accessible links', () => {
    queryMocks.useAccountSettings.mockReturnValue({
      data: {
        managed: true,
      },
      isLoading: false,
      error: null,
    });
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      queryClient,
    });

    expect(getByTestId(queryString).getAttribute('aria-current')).toBe('false');
  });

  it('should show Databases menu item if the user has the account capability V2', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />);

    const databaseNavItem = await findByTestId('menu-item-Databases');

    expect(databaseNavItem).toBeVisible();
  });

  it('should show Metrics and Alerts menu items if the user has the account capability, aclp feature flag is enabled, and aclpAlerting feature flag has any of the properties true', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclp: {
        beta: true,
        enabled: true,
        new: true,
      },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        notificationChannels: false,
        recentActivity: false,
      },
    };

    const { findAllByTestId, findByText, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = await findByText('Metrics');
    const monitorAlertsDisplayItem = await findByText('Alerts');
    const betaChip = await findAllByTestId('betaChip');
    const newFeatureChip = queryByTestId('newFeatureChip');
    expect(newFeatureChip).toBeNull(); // when beta is true, only beta chip is shown not new chip

    expect(monitorMetricsDisplayItem).toBeVisible();
    expect(monitorAlertsDisplayItem).toBeVisible();
    expect(betaChip).toHaveLength(2);
  });

  it('shoud show beta chip next to Metrics menu item if the user has the account capability and aclp feature flag has new true', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclp: {
        beta: false,
        enabled: true,
        new: true,
      },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        notificationChannels: false,
        recentActivity: false,
      },
    };

    const { findByText, findByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = await findByText('Metrics');
    const monitorAlertsDisplayItem = await findByText('Alerts');
    const newFeatureChip = await findByTestId('newFeatureChip');

    expect(monitorMetricsDisplayItem).toBeVisible();
    expect(monitorAlertsDisplayItem).toBeVisible();
    expect(newFeatureChip).toBeVisible();
  });

  it('should not show Metrics and Alerts menu items if the user has the account capability but the aclp feature flag is not enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclp: {
        beta: false,
        enabled: false,
      },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: false,
        notificationChannels: true,
        recentActivity: true,
      },
    };

    const { queryByTestId, queryByText } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = queryByText('Metrics');
    const monitorAlertsDisplayItem = queryByText('Alerts');

    expect(monitorMetricsDisplayItem).toBeNull();
    expect(monitorAlertsDisplayItem).toBeNull();
    expect(queryByTestId('betaChip')).toBeNull();
  });

  it('should show the new chip for Alerts if the user has the account capability, aclpAlerting feature flag has beta false and new as true', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclp: {
        beta: false,
        enabled: true,
      },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: false,
        new: true,
        notificationChannels: true,
        recentActivity: true,
      },
    };

    const { findByTestId, queryByTestId, findByText } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorAlertsDisplayItem = await findByText('Alerts');
    const betaChip = queryByTestId('betaChip');
    const newFeatureChip = await findByTestId('newFeatureChip');

    expect(monitorAlertsDisplayItem).toBeVisible();
    expect(betaChip).toBeNull();
    expect(newFeatureChip).toBeVisible();
  });
  it('should not show Alerts menu items if the user has the account capability, aclp feature flag is enabled, and aclpAlerting feature flag does not have any of the properties true', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclp: {
        beta: true,
        enabled: true,
      },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: false,
        beta: true,
        notificationChannels: false,
        recentActivity: false,
      },
    };

    const { findByTestId, findByText, queryByText } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = await findByText('Metrics'); // Metrics should be visible
    const monitorAlertsDisplayItem = queryByText('Alerts');
    const betaChip = await findByTestId('betaChip');

    expect(monitorMetricsDisplayItem).toBeVisible();
    expect(monitorAlertsDisplayItem).toBeNull();
    expect(betaChip).toBeVisible();
  });

  it('should show Logs menu item', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {});

    const logsNavItem = await findByTestId('menu-item-Logs');
    expect(logsNavItem).toBeVisible();
  });

  it('should show Administration links', async () => {
    const flags: Partial<Flags> = {
      iam: {
        enabled: true,
      },
      limitsEvolution: {
        enabled: true,
        requestForIncreaseDisabledForAll: true,
        requestForIncreaseDisabledForInternalAccountsOnly: true,
      },
    };

    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
    });

    renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const adminLink = screen.getByRole('button', { name: 'Administration' });
    expect(adminLink).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Billing' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Identity & Access' })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Quotas' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Login History' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Service Transfers' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Maintenance' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Account Settings' })
      ).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Account' })).toBeNull();
    });
  });

  it('should hide Identity & Access link for non beta users', async () => {
    const flags: Partial<Flags> = {
      iam: {
        enabled: false,
      },
    };

    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: false,
    });

    renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const adminLink = screen.getByRole('button', { name: 'Administration' });
    expect(adminLink).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Identity & Access' })
      ).toBeNull();
    });
  });

  it('should show Network Load Balancers menu item if the user has the account capability and the flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['Network LoadBalancer'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      networkLoadBalancer: true,
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const networkLoadbalancerNavItem = await findByTestId(
      'menu-item-Network Load Balancer'
    );

    expect(networkLoadbalancerNavItem).toBeVisible();
  });

  it('should show Partner Referral menu item if the user has the account capability and the flag is enabled', async () => {
    const flags: Partial<Flags> = {
      marketplaceV2: true,
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const partnerReferralNavItem = await findByTestId(
      'menu-item-Partner Referrals'
    );

    expect(partnerReferralNavItem).toBeVisible();
  });

  it('should show Reserved IPs menu item if the corresponding flag is enabled', async () => {
    const flags: Partial<Flags> = {
      reserveIp: true,
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const reservedIpsNavItem = await findByTestId('menu-item-Reserved IPs');

    expect(reservedIpsNavItem).toBeVisible();
  });

  it('should show NAT Gateways menu item if the user has the account capability and the flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['NAT Gateway'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      natgateway: {
        beta: false,
        enabled: true,
        ga: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const natGatewaysNavItem = await findByTestId('menu-item-NAT Gateways');

    expect(natGatewaysNavItem).toBeVisible();
  });

  it('should not show NAT Gateways menu item if the user lacks the account capability', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    };

    const { queryByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const natGatewaysNavItem = queryByTestId('menu-item-NAT Gateways');

    expect(natGatewaysNavItem).toBeNull();
  });

  it('should not show NAT Gateways menu item if the feature flag is disabled', async () => {
    const account = accountFactory.build({
      capabilities: ['NAT Gateway'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      natgateway: {
        beta: false,
        enabled: false,
        ga: false,
      },
    };

    const { queryByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const natGatewaysNavItem = queryByTestId('menu-item-NAT Gateways');

    expect(natGatewaysNavItem).toBeNull();
  });
});
