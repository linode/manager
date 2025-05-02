import { queryClientFactory } from '@linode/queries';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PrimaryNav from './PrimaryNav';

import type { ManagerPreferences } from '@linode/utilities';
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

describe('PrimaryNav', () => {
  const preference: ManagerPreferences['collapsedSideNavProductFamilies'] = [];

  const queryMocks = vi.hoisted(() => ({
    usePreferences: vi.fn().mockReturnValue({}),
  }));

  vi.mock('@linode/queries', async () => {
    const actual = await vi.importActual('@linode/queries');
    return {
      ...actual,
      usePreferences: queryMocks.usePreferences,
    };
  });

  it('only contains a "Managed" menu link if the user has Managed services.', async () => {
    server.use(
      http.get('*/account/maintenance', () => {
        return HttpResponse.json({ managed: false });
      })
    );

    const { findByTestId, getByTestId, queryByTestId, rerender } =
      renderWithTheme(<PrimaryNav {...props} />, { queryClient });
    expect(queryByTestId(queryString)).not.toBeInTheDocument();

    server.use(
      http.get('*/account/maintenance', () => {
        return HttpResponse.json({ managed: true });
      })
    );

    rerender(wrapWithTheme(<PrimaryNav {...props} />, { queryClient }));

    await findByTestId(queryString);

    getByTestId(queryString);
  });

  it('should have aria-current attribute for accessible links', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      queryClient,
    });

    expect(getByTestId(queryString).getAttribute('aria-current')).toBe('false');
  });

  it('should show Databases menu item if the user has the account capability V1', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
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

  it('should show Databases menu item if the user has the account capability V2 Beta', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

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
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

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
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

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

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: true,
        enabled: true,
      },
      aclpAlerting: {
        alertDefinitions: true,
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

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: false,
        enabled: false,
      },
      aclpAlerting: {
        alertDefinitions: true,
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

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: true,
        enabled: true,
      },
      aclpAlerting: {
        alertDefinitions: false,
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

  it('should not show Metrics and Alerts menu items if the user has the account capability but the aclp feature flag is not enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: true,
        enabled: false,
      },
      aclpAlerting: {
        alertDefinitions: true,
        notificationChannels: true,
        recentActivity: true,
      },
    };

    const { queryByText } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const monitorMetricsDisplayItem = queryByText('Metrics');
    const monitorAlertsDisplayItem = queryByText('Alerts');

    expect(monitorMetricsDisplayItem).toBeNull();
    expect(monitorAlertsDisplayItem).toBeNull();
  });

  it('should not show Alerts menu items if the user has the account capability, aclp feature flag is enabled, and aclpAlerting feature flag does not have any of the properties true', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: true,
        enabled: true,
      },
      aclpAlerting: {
        alertDefinitions: false,
        notificationChannels: false,
        recentActivity: false,
      },
    };

    const { findByText, queryByText } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const monitorMetricsDisplayItem = await findByText('Metrics'); // Metrics should be visible
    const monitorAlertsDisplayItem = queryByText('Alerts');

    expect(monitorMetricsDisplayItem).toBeVisible();
    expect(monitorAlertsDisplayItem).toBeNull();
  });
});
