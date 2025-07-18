import { linodeFactory, regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import {
  alertFactory,
  notificationChannelFactory,
  serviceTypesFactory,
} from 'src/factories/';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertDetail } from './AlertDetail';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });
const notificationChannels = notificationChannelFactory.buildList(3);

const linodes = linodeFactory.buildList(3);
const regions = regionFactory.buildList(3);

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useAllAlertNotificationChannelsQuery: vi.fn(),
  useCloudPulseServiceTypes: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
  useAllAlertNotificationChannelsQuery:
    queryMocks.useAllAlertNotificationChannelsQuery,
}));

vi.mock('src/queries/cloudpulse/services', () => {
  return {
    ...vi.importActual('src/queries/cloudpulse/services'),
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

// Shared Setup
beforeEach(() => {
  queryMocks.useAlertDefinitionQuery.mockReturnValue({
    data: alertDetails,
    isError: false,
    isFetching: false,
  });
  queryMocks.useCloudPulseServiceTypes.mockReturnValue({
    data: { data: serviceTypesFactory.buildList(1) },
    isFetching: false,
  });
  queryMocks.useResourcesQuery.mockReturnValue({
    data: linodes,
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isFetching: false,
  });
  queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
    data: notificationChannels,
    isError: false,
    isFetching: false,
  });
  queryMocks.useParams.mockReturnValue({
    alertId: '1',
    serviceType: 'linode',
  });
});

describe('AlertDetail component tests', () => {
  it('should render the error state on details API call failure', async () => {
    // return isError true
    queryMocks.useAlertDefinitionQuery.mockReturnValueOnce({
      data: null,
      isError: true,
      isFetching: false,
    });

    const { getByTestId, getByText } = renderWithTheme(<AlertDetail />, {
      initialRoute: '/alerts/definitions/detail/linode/1',
    });

    // Assert error message is displayed
    expect(
      getByText(
        'An error occurred while loading the definitions. Please try again later.'
      )
    ).toBeInTheDocument();

    // validate breadcrumbs on error state
    validateBreadcrumbs(getByTestId('link-text'));
  });

  it('should render the loading state when API call is fetching', async () => {
    // return isFetching true
    queryMocks.useAlertDefinitionQuery.mockReturnValueOnce({
      data: null,
      isError: false,
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(<AlertDetail />, {
      initialRoute: '/alerts/definitions/detail/linode/1',
    });

    expect(getByTestId('circle-progress')).toBeInTheDocument();

    // validate breadcrumbs on loading state
    validateBreadcrumbs(getByTestId('link-text'));
  });

  it('should render the component successfully with alert details overview', async () => {
    const { getByText } = renderWithTheme(<AlertDetail />, {
      initialRoute: '/alerts/definitions/detail/linode/1',
    });
    // validate overview is present with its couple of properties (values will be validated in its own components test)
    expect(getByText('Overview')).toBeInTheDocument();
    expect(getByText('Criteria')).toBeInTheDocument(); // validate if criteria is present
    expect(getByText('Entities')).toBeInTheDocument(); // validate if entities is present
    expect(getByText('Notification Channels')).toBeInTheDocument(); // validate if notification channels is present
    expect(getByText('Name:')).toBeInTheDocument();
    expect(getByText('Description:')).toBeInTheDocument();
  });

  it('should show error notice for failed alert', async () => {
    const alert = alertFactory.build({
      status: 'failed',
    });
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: alert,
      isError: false,
      isLoadiing: false,
    });

    renderWithTheme(<AlertDetail />, {
      initialRoute: '/alerts/definitions/detail/linode/1',
    });

    const element = screen.getByTestId('notice-error').textContent;
    expect(element).toEqual(
      `${alert.label} alert creation has failed. Please open a support ticket for assistance.`
    );
  });
});

const validateBreadcrumbs = (link: HTMLElement) => {
  expect(link).toBeInTheDocument();
  expect(link).toHaveTextContent('Definitions');
  expect(link.closest('a')).toHaveAttribute('href', '/alerts/definitions');
};
