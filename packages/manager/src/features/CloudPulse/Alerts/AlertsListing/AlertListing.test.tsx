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

import type { AclpServices } from 'src/featureFlags';

const queryMocks = vi.hoisted(() => ({
  useAllAlertDefinitionsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
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

const linodeLabel = 'Linode beta';
const databasesLabel = 'Databases beta';

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

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

queryMocks.useFlags.mockReturnValue({
  aclpServices: aclpServicesFlag,
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

describe('Alert Listing - Core Functionality', () => {
  beforeEach(() => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
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
  });

  it('should render the alert landing table with items', async () => {
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
      getByRole('option', { name: databasesLabel });
      getByRole('option', { name: linodeLabel });
    });
    await act(async () => {
      await userEvent.click(getByRole('option', { name: databasesLabel }));
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

  it('should show error notice for failed alerts', async () => {
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
      'Creation of 3 alerts has failed as indicated in the status column. Please open a support ticket for assistance.'
    );
  });

  it('should disable the create button when the alerts are loading', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: null,
      isError: false,
      isLoading: true,
    });

    renderWithTheme(<AlertListing />);

    const createButton = screen.getByRole('button', { name: 'Create Alert' });
    expect(createButton).toBeDisabled();
  });
});

describe('Alert Listing - Feature Flag Management', () => {
  beforeEach(() => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
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
  });

  it('should render the alerts from the enabled services', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: aclpServicesFlag,
    });

    renderWithTheme(<AlertListing />);

    expect(screen.getByText(mockResponse[0].label)).toBeVisible();
    expect(screen.getByText(mockResponse[1].label)).toBeVisible();
    expect(screen.getByText(mockResponse[2].label)).toBeVisible();
  });

  it('should not render the alerts from the disabled services', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          alerts: { enabled: false, beta: true },
          metrics: { enabled: false, beta: true },
        },
        dbaas: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
      },
    });

    renderWithTheme(<AlertListing />);
    expect(screen.queryByText(mockResponse[0].label)).not.toBeInTheDocument();
    expect(screen.queryByText(mockResponse[1].label)).not.toBeInTheDocument();
    expect(screen.queryByText(mockResponse[2].label)).not.toBeInTheDocument();
  });

  it('should not render the alerts from the services which are missing in the flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        dbaas: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
      },
    });

    renderWithTheme(<AlertListing />);
    expect(screen.queryByText(mockResponse[0].label)).not.toBeInTheDocument();
    expect(screen.queryByText(mockResponse[1].label)).not.toBeInTheDocument();
    expect(screen.queryByText(mockResponse[2].label)).not.toBeInTheDocument();
  });

  it('should render the service types based on the enabled services from the aclp services flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
        dbaas: {
          alerts: { enabled: false, beta: true },
          metrics: { enabled: false, beta: true },
        },
      },
    });

    renderWithTheme(<AlertListing />);

    const serviceFilterDropdown = screen.getByTestId('alert-service-filter');
    await userEvent.click(
      within(serviceFilterDropdown).getByRole('button', { name: 'Open' })
    );

    expect(screen.getByRole('option', { name: linodeLabel })).toBeVisible();
    expect(screen.queryByRole('option', { name: databasesLabel })).toBeNull(); // Verify that Databases is NOT present (filtered out by the flag)
  });

  it('should not return service types that are missing in the flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
      },
    });
    renderWithTheme(<AlertListing />);
    const serviceFilterDropdown = screen.getByTestId('alert-service-filter');
    await userEvent.click(
      within(serviceFilterDropdown).getByRole('button', { name: 'Open' })
    );
    expect(screen.getByRole('option', { name: linodeLabel })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Databases' })).toBeNull();
  });

  it('should not return service types that are missing the alerts property in the flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          metrics: { enabled: true, beta: true },
        },
      },
    });

    renderWithTheme(<AlertListing />);
    expect(screen.queryByRole('option', { name: 'Linode' })).toBeNull();
  });
});
