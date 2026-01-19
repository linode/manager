import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelAlertsFactory } from 'src/factories/cloudpulse/channels';
import { serviceTypesFactory } from 'src/factories/cloudpulse/services';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelAlerts } from './NotificationChannelAlerts';

const queryMocks = vi.hoisted(() => ({
  useAllAlertsByNotificationChannelIdQuery: vi.fn(),
  useCloudPulseServiceTypes: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
  useOrderV2: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  useAllAlertsByNotificationChannelIdQuery:
    queryMocks.useAllAlertsByNotificationChannelIdQuery,
}));

vi.mock('src/queries/cloudpulse/services', () => ({
  useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
}));

vi.mock('src/hooks/useOrderV2', () => ({
  useOrderV2: hookMocks.useOrderV2,
}));

describe('NotificationChannelAlerts', () => {
  const mockServiceTypes = serviceTypesFactory.buildList(3);
  const associatedAlertsText = 'Associated Alerts';
  const alertNameText = 'Alert Name';
  const serviceTypeText = 'Service';

  beforeEach(() => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: {
        data: mockServiceTypes,
      },
      isFetching: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state while fetching alerts', () => {
    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: null,
      isError: false,
      isLoading: true,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    screen.getByTestId('circle-progress');
  });

  it('should render loading state while fetching service types', () => {
    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
    });

    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: {
        data: mockServiceTypes,
      },
      isFetching: true,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    screen.getByTestId('circle-progress');
  });

  it('should render error state when alerts query fails', () => {
    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    expect(
      screen.getByText('Unable to load alerts for this channel.')
    ).toBeVisible();
  });

  it('should render notice when no alerts are associated', () => {
    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    expect(
      screen.getByText(
        /No alerts are associated with this notification channel./
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        /Add or assign alerts to start receiving notifications through this channel./
      )
    ).toBeVisible();
  });

  it('should render table with alerts when service_type is present', async () => {
    const alerts = notificationChannelAlertsFactory.buildList(3, {
      service_type: 'linode',
    });

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alerts,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    expect(screen.getByText(alertNameText)).toBeVisible();
    expect(screen.getByText(serviceTypeText)).toBeVisible();

    alerts.forEach((alert) => {
      expect(screen.getByText(alert.label)).toBeVisible();
    });
  });

  it('should render alerts with multiple service types correctly', () => {
    const alerts = [
      ...notificationChannelAlertsFactory.buildList(2, {
        service_type: 'linode',
      }),
      ...notificationChannelAlertsFactory.buildList(2, {
        service_type: 'dbaas',
      }),
    ];

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alerts,
    });

    renderWithTheme(<NotificationChannelAlerts channelId={1} />);

    expect(screen.getByText(associatedAlertsText)).toBeVisible();
    expect(screen.getByText(alertNameText)).toBeVisible();
    expect(screen.getByText(serviceTypeText)).toBeVisible();

    alerts.forEach((alert) => {
      expect(screen.getByText(alert.label)).toBeVisible();
    });
  });
});
