import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelAlertsFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { NotificationChannelAlertsTableRow } from './NotificationChannelAlertsTableRow';

import type { AclpServices } from 'src/featureFlags';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}));

const aclpServicesFlag: Partial<AclpServices> = {
  linode: {
    alerts: { enabled: true, beta: true },
    metrics: { enabled: true, beta: true },
  },
  dbaas: {
    alerts: { enabled: true, beta: true },
    metrics: { enabled: true, beta: true },
  },
};

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

queryMocks.useFlags.mockReturnValue({
  aclpServices: aclpServicesFlag,
});

describe('NotificationChannelAlertsTableRow', () => {
  it('should render alert with link', () => {
    const alert = notificationChannelAlertsFactory.build({
      id: 1,
      label: 'Test Alert',
      service_type: 'linode',
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={alert}
          serviceTypeLabel="Linode"
        />
      )
    );

    const link = screen.getByRole('link', { name: 'Test Alert' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/alerts/definitions/detail/linode/1');
    expect(screen.getByText('Linode')).toBeVisible();
  });

  it('should render Service Type cell', () => {
    const alert = notificationChannelAlertsFactory.build({
      id: 4,
      label: 'Service Alert',
      service_type: 'dbaas',
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={alert}
          serviceTypeLabel="Managed Databases"
        />
      )
    );

    // Should have two cells (Alert Name and Service Type)
    expect(screen.getAllByRole('cell')).toHaveLength(2);
    expect(screen.getByText('Managed Databases')).toBeVisible();
  });

  it('should render multiple service types correctly', () => {
    const linodeAlert = notificationChannelAlertsFactory.build({
      id: 7,
      label: 'Linode Alert',
      service_type: 'linode',
    });

    const dbaasAlert = notificationChannelAlertsFactory.build({
      id: 8,
      label: 'Database Alert',
      service_type: 'dbaas',
    });

    const { rerender } = renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={linodeAlert}
          serviceTypeLabel="Linode"
        />
      )
    );

    expect(screen.getByText('Linode Alert')).toBeVisible();
    expect(screen.getByText('Linode')).toBeVisible();

    rerender(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={dbaasAlert}
          serviceTypeLabel="Managed Databases"
        />
      )
    );

    expect(screen.getByText('Database Alert')).toBeVisible();
    expect(screen.getByText('Managed Databases')).toBeVisible();
  });
});
