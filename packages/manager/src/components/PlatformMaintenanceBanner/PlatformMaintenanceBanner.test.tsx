/* eslint-disable testing-library/prefer-screen-queries */
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
  it("doesn't render when there is no platform maintenance", async () => {
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

  it('renders with generic message when there is a notification', async () => {
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

    const { findByText } = renderWithTheme(<PlatformMaintenanceBanner />);

    expect(await findByText('One or more Linodes')).toBeVisible();
    expect(
      await findByText((el) =>
        el.includes('need to be rebooted for critical platform maintenance.')
      )
    ).toBeVisible();
  });

  it('renders with count of affected linodes', async () => {
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

    const { findByText } = renderWithTheme(<PlatformMaintenanceBanner />);

    expect(await findByText('2 Linodes')).toBeVisible();
    expect(
      await findByText((el) =>
        el.includes('need to be rebooted for critical platform maintenance.')
      )
    ).toBeVisible();
  });
});
