import React from 'react';

import { notificationChannelAlertsFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { NotificationChannelAlertsTableRow } from './NotificationChannelAlertsTableRow';

import type { AclpServices } from 'src/featureFlags';

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
const mockFlags = {
  aclpServices: aclpServicesFlag,
};

describe('NotificationChannelAlertsTableRow', () => {
  it('should render alert with link', () => {
    const alert = notificationChannelAlertsFactory.build({
      id: 1,
      label: 'Test Alert',
      service_type: 'linode',
    });

    const { getByRole, getByText } = renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={alert}
          serviceTypeLabel="Linode"
        />
      ),
      {
        flags: mockFlags,
      }
    );

    const link = getByRole('link', { name: 'Test Alert' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/alerts/definitions/detail/linode/1');
    expect(getByText('Linode')).toBeVisible();
  });

  it('should render Service Type cell', () => {
    const alert = notificationChannelAlertsFactory.build({
      id: 4,
      label: 'Service Alert',
      service_type: 'dbaas',
    });

    const { getAllByRole, getByText } = renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={alert}
          serviceTypeLabel="Managed Databases"
        />
      ),
      {
        flags: mockFlags,
      }
    );

    // Should have two cells (Alert Name and Service Type)
    expect(getAllByRole('cell')).toHaveLength(2);
    expect(getByText('Managed Databases')).toBeVisible();
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

    const { getByText, rerender } = renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={linodeAlert}
          serviceTypeLabel="Linode"
        />
      ),
      {
        flags: mockFlags,
      }
    );

    expect(getByText('Linode Alert')).toBeVisible();
    expect(getByText('Linode')).toBeVisible();

    rerender(
      wrapWithTableBody(
        <NotificationChannelAlertsTableRow
          alert={dbaasAlert}
          serviceTypeLabel="Managed Databases"
        />
      )
    );

    expect(getByText('Database Alert')).toBeVisible();
    expect(getByText('Managed Databases')).toBeVisible();
  });
});
