import React from 'react';

import { accountMaintenanceFactory, notificationFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlatformMaintenanceBanner } from './PlatformMaintenanceBanner';

const queryMocks = vi.hoisted(() => ({
  useNotificationsQuery: vi.fn().mockReturnValue({}),
  useAllAccountMaintenanceQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    ...queryMocks,
  };
});

describe('PlatformMaintenanceBanner', () => {
  it("doesn't render when there is no platform maintenance", () => {
    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: accountMaintenanceFactory.buildList(3, {
        type: 'reboot',
        entity: {
          type: 'linode',
        },
      }),
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: [],
    });

    const { queryByText } = renderWithTheme(<PlatformMaintenanceBanner />);

    expect(queryByText('One or more Linodes')).not.toBeInTheDocument();
    expect(
      queryByText('needs to be rebooted for critical platform maintenance.')
    ).not.toBeInTheDocument();
  });

  it('renders with generic message when there is a notification', () => {
    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: accountMaintenanceFactory.buildList(3, {
        type: 'reboot',
        entity: {
          type: 'linode',
        },
        reason: 'Unrelated maintenance',
      }),
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { getByText } = renderWithTheme(<PlatformMaintenanceBanner />);

    expect(getByText('One or more Linodes')).toBeVisible();
    expect(
      getByText((el) =>
        el.includes('need to be rebooted for critical platform maintenance.')
      )
    ).toBeVisible();
  });

  it('renders with count of affected linodes', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(2, {
      type: 'reboot',
      entity: { type: 'linode' },
      reason: 'Your Linode needs a critical security update',
    });
    const mockMaintenance = [
      ...mockPlatformMaintenance,
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode' },
        reason: 'Unrelated maintenance item',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { getByText } = renderWithTheme(<PlatformMaintenanceBanner />);

    expect(getByText('2 Linodes')).toBeVisible();
    expect(
      getByText((el) =>
        el.includes('need to be rebooted for critical platform maintenance.')
      )
    ).toBeVisible();
  });

  it('does not show Account Maintenance link when pathname is /maintenance', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(1, {
      type: 'reboot',
      entity: { type: 'linode' },
      reason: 'Your Linode needs a critical security update',
    });

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockPlatformMaintenance,
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { queryByTestId } = renderWithTheme(<PlatformMaintenanceBanner />, {
      initialRoute: '/maintenance',
    });

    // Should show the platform maintenance banner but not the maintenance link section
    expect(
      queryByTestId('platform-maintenance-link-section')
    ).not.toBeInTheDocument();
  });

  it('shows Account Maintenance link when pathname is not /maintenance', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(1, {
      type: 'reboot',
      entity: { type: 'linode' },
      reason: 'Your Linode needs a critical security update',
    });

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockPlatformMaintenance,
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { getByTestId } = renderWithTheme(<PlatformMaintenanceBanner />, {
      initialRoute: '/dashboard',
    });

    // Should show the platform maintenance banner AND the maintenance link section
    getByTestId('platform-maintenance-link-section');
  });
});
