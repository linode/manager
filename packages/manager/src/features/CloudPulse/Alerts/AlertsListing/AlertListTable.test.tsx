import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsListTable } from './AlertListTable';

const queryMocks = vi.hoisted(() => ({
  useEditAlertDefinition: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
}));

queryMocks.useEditAlertDefinition.mockReturnValue({
  isError: false,
  mutateAsync: vi.fn().mockResolvedValue({}),
  reset: vi.fn(),
});

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
    expect(getByText('Error in fetching the alerts')).toBeVisible();
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

  it('should show success snackbar when enabling alert succeeds', async () => {
    const alert = alertFactory.build({ status: 'disabled', type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Enable')); // click the enable button to enable alert
    expect(getByText('Alert enabled')).toBeInTheDocument(); // validate whether snackbar is displayed properly if alert is enabled successfully
  });

  it('should show success snackbar when disabling alert succeeds', async () => {
    const alert = alertFactory.build({ status: 'enabled', type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Disable')); // click the enable button to enable alert
    expect(getByText('Alert disabled')).toBeInTheDocument(); // validate whether snackbar is displayed properly if alert is disabled successfully
  });

  it('should show error snackbar when enabling alert fails', async () => {
    queryMocks.useEditAlertDefinition.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue({}),
    });

    const alert = alertFactory.build({ status: 'disabled', type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Enable'));

    expect(getByText('Enabling alert failed')).toBeInTheDocument(); // validate whether snackbar is displayed properly if an error is encountered while enabling an alert
  });

  it('should show error snackbar when disabling alert fails', async () => {
    queryMocks.useEditAlertDefinition.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue({}),
    });

    const alert = alertFactory.build({ status: 'enabled', type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Disable'));

    expect(getByText('Disabling alert failed')).toBeInTheDocument(); // validate whether snackbar is displayed properly if an error is encountered while disabling an alert
  });
});
