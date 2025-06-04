import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import {
  DELETE_ALERT_SUCCESS_MESSAGE,
  UPDATE_ALERT_SUCCESS_MESSAGE,
} from '../constants';
import { AlertsListTable } from './AlertListTable';

const queryMocks = vi.hoisted(() => ({
  useEditAlertDefinition: vi.fn(),
  useDeleteAlertDefinitionMutation: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
  useDeleteAlertDefinitionMutation: queryMocks.useDeleteAlertDefinitionMutation,
}));

queryMocks.useEditAlertDefinition.mockReturnValue({
  isError: false,
  mutateAsync: vi.fn().mockResolvedValue({}),
  reset: vi.fn(),
});
const mockScroll = vi.fn();
queryMocks.useDeleteAlertDefinitionMutation.mockReturnValue({
  isError: false,
  mutateAsync: vi.fn().mockResolvedValue({}),
  reset: vi.fn(),
});

describe('Alert List Table test', () => {
  it('should render the alert landing table ', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[]}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[]}
      />
    );
    expect(getByText('Alert Name')).toBeVisible();
    expect(getByText('Service')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Last Modified')).toBeVisible();
    expect(getByText('Created By')).toBeVisible();
  });

  it('should render the error message', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[]}
        error={[{ reason: 'Error in fetching the alerts' }]}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[]}
      />
    );
    expect(getByText('Error in fetching the alerts')).toBeVisible();
  });

  it('should render the alert row', async () => {
    const updated = new Date().toISOString();
    const alert = alertFactory.build({
      created_by: 'user1',
      label: 'Test Alert',
      service_type: 'linode',
      status: 'enabled',
      updated,
      updated_by: 'user2',
    });
    const { getByTestId, getByText } = await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );
    expect(getByText('Test Alert')).toBeVisible();
    expect(getByText('Linode')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();

    expect(getByTestId(`created-by-${alert.id}`).textContent).toBe('user1');
    expect(getByTestId(`updated-by-${alert.id}`).textContent).toBe('user2');

    expect(getByTestId(`updated-${alert.id}`).textContent).toBe(
      formatDate(updated, {
        format: 'MMM dd, yyyy, h:mm a',
      })
    );
  });

  it('should show success snackbar when enabling alert succeeds', async () => {
    const alert = alertFactory.build({ status: 'disabled', type: 'user' });
    const { getByLabelText, getByRole, getByTestId, getByText } =
      await renderWithThemeAndRouter(
        <AlertsListTable
          alerts={[alert]}
          isLoading={false}
          scrollToElement={mockScroll}
          services={[{ label: 'Linode', value: 'linode' }]}
        />
      );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Enable')); // click the enable button to enable alert

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Enable' }));

    expect(getByText(UPDATE_ALERT_SUCCESS_MESSAGE)).toBeInTheDocument(); // validate whether snackbar is displayed properly
  });

  it('should show success snackbar when disabling alert succeeds', async () => {
    const alert = alertFactory.build({ status: 'enabled', type: 'user' });
    const { getByLabelText, getByRole, getByTestId, getByText } =
      await renderWithThemeAndRouter(
        <AlertsListTable
          alerts={[alert]}
          isLoading={false}
          scrollToElement={mockScroll}
          services={[{ label: 'Linode', value: 'linode' }]}
        />
      );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Disable')); // click the enable button to enable alert

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Disable' }));

    expect(getByText(UPDATE_ALERT_SUCCESS_MESSAGE)).toBeInTheDocument(); // validate whether snackbar is displayed properly
  });

  it('should show error snackbar when enabling alert fails', async () => {
    queryMocks.useEditAlertDefinition.mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue([{ reason: 'Enabling alert failed' }]),
    });

    const alert = alertFactory.build({ status: 'disabled', type: 'user' });
    const { getByLabelText, getByRole, getByTestId, getByText } =
      await renderWithThemeAndRouter(
        <AlertsListTable
          alerts={[alert]}
          isLoading={false}
          scrollToElement={mockScroll}
          services={[{ label: 'Linode', value: 'linode' }]}
        />
      );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Enable'));

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Enable' }));

    expect(getByText('Enabling alert failed')).toBeInTheDocument(); // validate whether snackbar is displayed properly if an error is encountered while enabling an alert
  });

  it('should show error snackbar when disabling alert fails', async () => {
    queryMocks.useEditAlertDefinition.mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue([{ reason: 'Disabling alert failed' }]),
    });

    const alert = alertFactory.build({ status: 'enabled', type: 'user' });
    const { getByLabelText, getByRole, getByTestId, getByText } =
      await renderWithThemeAndRouter(
        <AlertsListTable
          alerts={[alert]}
          isLoading={false}
          scrollToElement={mockScroll}
          services={[{ label: 'Linode', value: 'linode' }]}
        />
      );

    const actionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Disable'));

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Disable' }));

    expect(getByText('Disabling alert failed')).toBeInTheDocument(); // validate whether snackbar is displayed properly if an error is encountered while disabling an alert
  });

  it('should toggle alerts grouped by tag', async () => {
    await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[alertFactory.build({ label: 'Test Alert' })]}
        isGroupedByTag={true}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[{ label: 'Linode', value: 'linode' }]}
        toggleGroupByTag={() => true}
      />
    );
    const toggleButton = screen.getByLabelText('Toggle group by tag');
    await userEvent.click(toggleButton);
    expect(screen.getByText('tag1')).toBeVisible();
    expect(screen.getByText('tag2')).toBeVisible();
  });

  it('should show success snackbar when deleting alert succeeds', async () => {
    const alert = alertFactory.build({ type: 'user' });
    await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = screen.getByLabelText(
      `Action menu for Alert ${alert.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(screen.getByText('Delete'));

    expect(screen.getByText(`Delete ${alert.label}?`)).toBeVisible();
    const textInput = screen.getByTestId('textfield-input');
    await userEvent.type(textInput, alert.label);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText(DELETE_ALERT_SUCCESS_MESSAGE)).toBeVisible();
  });

  it('should show the proper api error message in error snackbar when deleting alert fails with a reason', async () => {
    queryMocks.useDeleteAlertDefinitionMutation.mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue([{ reason: 'Deleting alert failed' }]),
    });

    const alert = alertFactory.build({ type: 'user' });
    await renderWithThemeAndRouter(
      <AlertsListTable
        alerts={[alert]}
        isLoading={false}
        scrollToElement={mockScroll}
        services={[{ label: 'Linode', value: 'linode' }]}
      />
    );

    const actionMenu = screen.getByLabelText(
      `Action menu for Alert ${alert.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(screen.getByText('Delete'));

    expect(screen.getByText(`Delete ${alert.label}?`)).toBeVisible();
    const textInput = screen.getByTestId('textfield-input');
    await userEvent.type(textInput, alert.label);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText('Deleting alert failed')).toBeVisible();
  });
});
