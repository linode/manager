import { renderHook } from '@testing-library/react';

import { accountMaintenanceFactory, notificationFactory } from 'src/factories';

import { usePlatformMaintenance } from './usePlatformMaintenance';

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

describe('usePlatformMaintenace', () => {
  it('returns false when there is no platform maintenance notification', () => {
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

    const { result } = renderHook(() => usePlatformMaintenance());

    expect(result.current.accountHasPlatformMaintenance).toBe(false);
  });

  it('returns true when there is a platform maintenance notifications', () => {
    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: [],
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { result } = renderHook(() => usePlatformMaintenance());

    expect(result.current).toEqual({
      accountHasPlatformMaintenance: true,
      linodesWithPlatformMaintenance: new Set(),
      platformMaintenanceByLinode: {},
    });
  });

  it('includes linodes with platform maintenance', () => {
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

    const { result } = renderHook(() => usePlatformMaintenance());

    expect(result.current).toEqual({
      accountHasPlatformMaintenance: true,
      linodesWithPlatformMaintenance: new Set(
        mockPlatformMaintenance.map((m) => m.entity.id)
      ),
      platformMaintenanceByLinode: Object.fromEntries(
        mockPlatformMaintenance.map((m) => [m.entity.id, [m]])
      ),
    });
  });
});
