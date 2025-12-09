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
    isIAMBeta: false,
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

  it('should show Databases menu item if the user has the account capability V1', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const databaseNavItem = screen.getByTestId('menu-item-Databases');

    expect(databaseNavItem).toBeVisible();
    expect(screen.queryByTestId('betaChip')).toBeNull();
  });

  it('should show Databases menu item if the user has the account capability V2 Beta', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const databaseNavItem = await findByTestId('menu-item-Databases');
    const betaChip = await findByTestId('betaChip');

    expect(databaseNavItem).toBeVisible();
    expect(betaChip).toBeVisible();
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

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const databaseNavItem = await findByTestId('menu-item-Databases');

    expect(databaseNavItem).toBeVisible();
    expect(queryByTestId('betaChip')).toBeNull();
  });

  it('should show Databases menu item if the user has the account capability V2', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

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

    const { findAllByTestId, findByText } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = await findByText('Metrics');
    const monitorAlertsDisplayItem = await findByText('Alerts');
    const betaChip = await findAllByTestId('betaChip');

    expect(monitorMetricsDisplayItem).toBeVisible();
    expect(monitorAlertsDisplayItem).toBeVisible();
    expect(betaChip).toHaveLength(2);
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

  it('should show Logs menu item if user has capability and aclpLogs flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse Logs'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        bypassAccountCapabilities: false,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      { flags }
    );

    const logsNavItem = await findByTestId('menu-item-Logs');
    expect(logsNavItem).toBeVisible();
    expect(queryByTestId('betaChip')).toBeNull();
  });

  it('should not show Logs menu item if aclpLogs flag is not enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse Logs'],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclpLogs: {
        enabled: false,
        beta: false,
        bypassAccountCapabilities: true,
      },
    };

    const { queryByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    expect(queryByTestId('menu-item-Logs')).toBeNull();
  });

  it('should show Logs menu item if user lacks capability, bypassAccountCapabilities is true and aclpLogs flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclpLogs: {
        enabled: true,
        beta: true,
        bypassAccountCapabilities: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const logsNavItem = await findByTestId('menu-item-Logs');
    expect(logsNavItem).toBeVisible();
    const betaChip = await findByTestId('betaChip');
    expect(betaChip).toBeVisible();
  });

  it('should not show Logs menu item if user lacks capability, bypassAccountCapabilities is false and aclpLogs flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    queryMocks.useAccount.mockReturnValue({
      data: account,
      isLoading: false,
      error: null,
    });

    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        bypassAccountCapabilities: false,
      },
    };

    const { queryByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    expect(queryByTestId('menu-item-Logs')).toBeNull();
  });

  it('should show Administration links if iamRbacPrimaryNavChanges flag is enabled', async () => {
    const flags: Partial<Flags> = {
      iamRbacPrimaryNavChanges: true,
      iam: {
        beta: true,
        enabled: true,
      },
      limitsEvolution: {
        enabled: true,
        requestForIncreaseDisabledForAll: true,
        requestForIncreaseDisabledForInternalAccountsOnly: true,
      },
    };

    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMBeta: true,
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
      iamRbacPrimaryNavChanges: true,
      iam: {
        beta: true,
        enabled: false,
      },
    };

    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMBeta: true,
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

  it('should show Account link and hide Administration if iamRbacPrimaryNavChanges flag is disabled', async () => {
    const flags: Partial<Flags> = {
      iamRbacPrimaryNavChanges: false,
      iam: {
        beta: true,
        enabled: true,
      },
    };

    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMBeta: true,
      isIAMEnabled: true,
    });

    renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const adminLink = screen.queryByRole('button', { name: 'Administration' });
    expect(adminLink).toBeNull();

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Billing' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Quotas' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Login History' })).toBeNull();
      expect(
        screen.queryByRole('link', { name: 'Service Transfers' })
      ).toBeNull();
      expect(screen.queryByRole('link', { name: 'Maintenance' })).toBeNull();
      expect(
        screen.queryByRole('link', { name: 'Account' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Identity & Access' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Account Settings' })
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

    const databaseNavItem = await findByTestId(
      'menu-item-Network Load Balancer'
    );

    expect(databaseNavItem).toBeVisible();
  });
});
