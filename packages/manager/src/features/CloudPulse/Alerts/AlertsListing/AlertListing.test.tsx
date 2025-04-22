import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  alertFactory,
  alertRulesFactory,
} from 'src/factories/cloudpulse/alerts';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertListing } from './AlertListing';
import {
  alertLimitMessage,
  alertToolTipText,
  metricLimitMessage,
} from './constants';

const queryMocks = vi.hoisted(() => ({
  useAllAlertDefinitionsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAllAlertDefinitionsQuery: queryMocks.useAllAlertDefinitionsQuery,
  };
});

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

const mockResponse = alertFactory.buildList(3);
const serviceTypes = [
  {
    label: 'Databases',
    service_type: 'dbaas',
  },
  {
    label: 'Linode',
    service_type: 'linode',
  },
];

describe('Alert Listing', () => {
  it('should render the alert landing table with items', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(<AlertListing />);
    expect(screen.getByText('Alert Name')).toBeVisible();
    expect(screen.getByText('Service')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
    expect(screen.getByText('Last Modified')).toBeVisible();
    expect(screen.getByText('Created By')).toBeVisible();
    expect(screen.getByLabelText('Toggle group by tag')).toBeVisible();
    const firstActionMenu = screen.getAllByLabelText(
      `Action menu for Alert ${mockResponse[0].label}`
    )[0];
    await userEvent.click(firstActionMenu);
    expect(screen.getByTestId('Show Details')).toBeVisible();
  });

  it('should render the alert row', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByText } = renderWithTheme(<AlertListing />);
    expect(getByText(mockResponse[0].label)).toBeVisible();
    expect(getByText(mockResponse[1].label)).toBeVisible();
    expect(getByText(mockResponse[2].label)).toBeVisible();
  });

  it('should filter the alerts with service filter', async () => {
    const linodeAlert = alertFactory.build({ service_type: 'linode' });
    const dbaasAlert = alertFactory.build({ service_type: 'dbaas' });
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: [linodeAlert, dbaasAlert],
      isError: false,
      isLoading: false,
      status: 'success',
    });

    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: { data: serviceTypes },
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByRole, getByTestId, getByText, queryByText } = renderWithTheme(
      <AlertListing />
    );
    const serviceFilter = getByTestId('alert-service-filter');
    expect(getByText(linodeAlert.label)).toBeVisible();
    expect(getByText(dbaasAlert.label)).toBeVisible();

    await userEvent.click(
      within(serviceFilter).getByRole('button', { name: 'Open' })
    );
    await waitFor(() => {
      getByRole('option', { name: 'Databases' });
      getByRole('option', { name: 'Linode' });
    });
    await act(async () => {
      await userEvent.click(getByRole('option', { name: 'Databases' }));
    });

    await waitFor(() => {
      expect(queryByText(linodeAlert.label)).not.toBeInTheDocument();
      expect(getByText(dbaasAlert.label)).toBeVisible();
    });
  });

  it('should filter the alerts with status filter', async () => {
    const enabledAlert = alertFactory.build({ status: 'enabled' });
    const disabledAlert = alertFactory.build({ status: 'disabled' });
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: [enabledAlert, disabledAlert],
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByRole, getByTestId, getByText, queryByText } = renderWithTheme(
      <AlertListing />
    );
    const statusFilter = getByTestId('alert-status-filter');
    expect(getByText(enabledAlert.label)).toBeVisible();
    expect(getByText(disabledAlert.label)).toBeVisible();

    await userEvent.click(
      within(statusFilter).getByRole('button', { name: 'Open' })
    );

    await waitFor(() => {
      getByRole('option', { name: 'Enabled' });
      getByRole('option', { name: 'Disabled' });
    });

    await act(async () => {
      await userEvent.click(getByRole('option', { name: 'Enabled' }));
    });
    await waitFor(() => {
      expect(getByText(enabledAlert.label)).toBeVisible();
      expect(queryByText(disabledAlert.label)).not.toBeInTheDocument();
    });
  });

  it('should filter the alerts with search text', async () => {
    const alert1 = alertFactory.build({ label: 'alert1' });
    const alert2 = alertFactory.build({ label: 'alert2' });

    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: [alert1, alert2],
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme(
      <AlertListing />
    );
    const searchInput = getByPlaceholderText('Search for Alerts');
    await userEvent.type(searchInput, 'alert1');

    await waitFor(() => {
      expect(getByText(alert1.label)).toBeVisible();
      expect(queryByText(alert2.label)).not.toBeInTheDocument();
    });
  });

  it('should show the banner and disable the create button when the user has reached the maximum allowed user alerts', async () => {
    const userAlerts = alertFactory.buildList(100, { type: 'user' });
    const systemAlerts = alertFactory.buildList(10, { type: 'system' });

    queryMocks.useAllAlertDefinitionsQuery.mockReturnValueOnce({
      data: [...userAlerts, ...systemAlerts],
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(<AlertListing />);

    expect(screen.getByText(alertLimitMessage)).toBeVisible();
    const createButton = screen.getByRole('button', { name: 'Create Alert' });

    expect(createButton).toBeDisabled();
    await userEvent.hover(createButton);
    await waitFor(() => {
      expect(screen.getByText(alertToolTipText)).toBeVisible();
    });
  });

  it('should show the banner and disable the create button when the user has reached the maximum allowed user metrics', async () => {
    const userAlerts = alertFactory.buildList(25, {
      rule_criteria: {
        rules: alertRulesFactory.buildList(4, { dimension_filters: [] }),
      },
      type: 'user',
    });
    const systemAlerts = alertFactory.buildList(10, { type: 'system' });

    queryMocks.useAllAlertDefinitionsQuery.mockReturnValueOnce({
      data: [...userAlerts, ...systemAlerts],
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(<AlertListing />);

    expect(screen.getByText(metricLimitMessage)).toBeVisible();
    const createButton = screen.getByRole('button', { name: 'Create Alert' });

    expect(createButton).toBeDisabled();
    await userEvent.hover(createButton);
    await waitFor(() => {
      expect(screen.getByText(alertToolTipText)).toBeVisible();
    });
  });

  it('should show error notice for failed alerts', () => {
    const alerts = alertFactory.buildList(3, {
      status: 'failed',
    });
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: alerts,
      isError: false,
      isLoading: false,
    });

    const { getByTestId } = renderWithTheme(<AlertListing />);

    const element = getByTestId('notice-error').textContent;
    expect(element).toEqual(
      'Creation of some alerts has failed. Please contact support for assistance.'
    );
  });
});
