import { linodeFactory } from '@linode/utilities';
import React from 'react';

import { accountMaintenanceFactory, notificationFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodePlatformMaintenanceBanner } from './LinodePlatformMaintenanceBanner';

const queryMocks = vi.hoisted(() => ({
  useNotificationsQuery: vi.fn().mockReturnValue({}),
  useAllAccountMaintenanceQuery: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    ...queryMocks,
  };
});

beforeEach(() => {
  vi.stubEnv('TZ', 'UTC');
});

describe('LinodePlatformMaintenanceBanner', () => {
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

    const { queryByText } = renderWithTheme(
      <LinodePlatformMaintenanceBanner linodeId={1} />
    );

    expect(
      queryByText('needs to be rebooted for critical platform maintenance.')
    ).not.toBeInTheDocument();
  });

  it('does not render if there is a notification but not a maintenance item', () => {
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

    const { queryByText } = renderWithTheme(
      <LinodePlatformMaintenanceBanner linodeId={1} />
    );

    expect(
      queryByText('needs to be rebooted for critical platform maintenance.')
    ).not.toBeInTheDocument();
  });

  it('renders when a maintenance item is returned', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(2, {
      type: 'reboot',
      entity: { type: 'linode' },
      reason: 'Your Linode needs a critical security update',
      when: '2020-01-01T00:00:00',
      start_time: '2020-01-01T00:00:00',
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

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: mockPlatformMaintenance[0].entity.id,
        label: 'linode-with-platform-maintenance',
      }),
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { getByText } = renderWithTheme(
      <LinodePlatformMaintenanceBanner
        linodeId={mockPlatformMaintenance[0].entity.id}
      />
    );

    expect(getByText('linode-with-platform-maintenance')).toBeVisible();
    expect(
      getByText((el) =>
        el.includes('needs to be rebooted for critical platform maintenance.')
      )
    ).toBeVisible();
  });

  it('renders linode label as a link when not on linode detail page', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(1, {
      type: 'reboot',
      entity: { type: 'linode', id: 123 },
      reason: 'Your Linode needs a critical security update',
      when: '2020-01-01T00:00:00',
      start_time: '2020-01-01T00:00:00',
    });

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockPlatformMaintenance,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 123,
        label: 'test-linode',
      }),
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { getByRole } = renderWithTheme(
      <LinodePlatformMaintenanceBanner linodeId={123} />
    );

    const link = getByRole('link', { name: 'test-linode' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/linodes/123');
  });

  it('renders linode label as plain text when on linode detail page', () => {
    const mockPlatformMaintenance = accountMaintenanceFactory.buildList(1, {
      type: 'reboot',
      entity: { type: 'linode', id: 123 },
      reason: 'Your Linode needs a critical security update',
      when: '2020-01-01T00:00:00',
      start_time: '2020-01-01T00:00:00',
    });

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockPlatformMaintenance,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 123,
        label: 'test-linode',
      }),
    });

    queryMocks.useNotificationsQuery.mockReturnValue({
      data: notificationFactory.buildList(1, {
        type: 'security_reboot_maintenance_scheduled',
        label: 'Platform Maintenance Scheduled',
      }),
    });

    const { container, queryByRole } = renderWithTheme(
      <LinodePlatformMaintenanceBanner linodeId={123} />,
      {
        initialRoute: '/linodes/123',
      }
    );

    // Should show the label as plain text within the Typography component
    expect(container.textContent).toContain('test-linode');

    // Should not have a link
    expect(
      queryByRole('link', { name: 'test-linode' })
    ).not.toBeInTheDocument();
  });
});
