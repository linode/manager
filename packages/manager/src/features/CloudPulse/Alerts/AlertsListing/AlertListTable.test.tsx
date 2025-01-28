import { waitFor } from '@testing-library/react';
import React from 'react';

import { alertFactory } from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsListTable } from './AlertListTable';

describe('Alert List Table test', () => {
  it('should render the alert landing table ', async () => {
    const { getByText } = renderWithTheme(
      <AlertsListTable alerts={[]} isLoading={false} services={[]} />
    );
    expect(getByText('Alert Name')).toBeVisible();
    expect(getByText('Service')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Last Modified')).toBeVisible();
    expect(getByText('Created By')).toBeVisible();
  });

  it('should render the error message', async () => {
    const { getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[]}
        error={[{ reason: 'Error in fetching the alerts' }]}
        isLoading={false}
        services={[]}
      />
    );
    await waitFor(() => {
      expect(getByText('Error in fetching the alerts')).toBeVisible();
    });
  });

  it('should render the alert row', async () => {
    const updated = new Date().toISOString();
    const { getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[
          alertFactory.build({
            created_by: 'user1',
            label: 'Test Alert',
            service_type: 'linode',
            status: 'enabled',
            updated,
          }),
        ]}
        isLoading={false}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );
    expect(getByText('Test Alert')).toBeVisible();
    expect(getByText('Linode')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
    expect(getByText('user1')).toBeVisible();
    expect(
      getByText(
        formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
        })
      )
    ).toBeVisible();
  });
});
