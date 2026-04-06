import React from 'react';

import { notificationChannelAlertsFactory } from 'src/factories/cloudpulse/channels';
import { serviceTypesFactory } from 'src/factories/cloudpulse/services';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { getAssociatedAlerts } from '../Utils/utils';
import { NotificationChannelAlerts } from './NotificationChannelAlerts';

import type { Item } from '../../constants';
import type { CloudPulseServiceType } from '@linode/api-v4';

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

  const mockFlags = {
    aclpServices: {
      dbaas: { alerts: { beta: true, enabled: true } },
      linode: { alerts: { beta: true, enabled: true } },
    },
  };
  beforeEach(() => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: {
        data: mockServiceTypes,
      },
      isServiceTypesLoading: false,
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
      data: undefined,
      isError: false,
      isLoading: true,
    });

    const { getByText, getByTestId } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText(associatedAlertsText)).toBeVisible();
    expect(getByTestId('table-row-loading')).toBeVisible();
  });

  it('should render error state when alerts query fails', () => {
    const mockError = [{ reason: 'Error loading alerts' }];

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: undefined,
      error: mockError,
      isError: true,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText(associatedAlertsText)).toBeVisible();
    expect(getByText('Error loading alerts')).toBeVisible();
  });

  it('should render notice when no alerts are associated', () => {
    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: [],
      error: undefined,
      isError: false,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText(associatedAlertsText)).toBeVisible();
    expect(
      getByText(/No alerts are associated with this notification channel./)
    ).toBeVisible();
    expect(
      getByText(
        /Add or assign alerts to start receiving notifications through this channel./
      )
    ).toBeVisible();
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

    const alertsWithServiceLabel = alerts.map((alert) => ({
      ...alert,
      service_type_label: mockServiceTypes.find(
        (st) => st.service_type === alert.service_type
      )?.label,
    }));

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      error: undefined,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alertsWithServiceLabel,
    });

    const { getByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText(associatedAlertsText)).toBeVisible();
    expect(getByText(alertNameText)).toBeVisible();
    expect(getByText(serviceTypeText)).toBeVisible();

    alerts.forEach((alert) => {
      expect(getByText(alert.label)).toBeVisible();
    });
  });

  it('should filter alerts by search text', () => {
    const alerts = [
      notificationChannelAlertsFactory.build({
        label: 'Database Alert',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'CPU Alert',
        service_type: 'linode',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Memory Alert',
        service_type: 'linode',
      }),
    ];

    // Use the utility function to filter alerts by search text
    const filteredAlerts = getAssociatedAlerts(alerts, [], 'cpu');

    const alertsWithServiceLabel = filteredAlerts.map((alert) => ({
      ...alert,
      service_type_label: mockServiceTypes.find(
        (st) => st.service_type === alert.service_type
      )?.label,
    }));

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      error: undefined,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alertsWithServiceLabel,
    });

    const { getByText, queryByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText('CPU Alert')).toBeVisible();
    expect(queryByText('Database Alert')).not.toBeInTheDocument();
    expect(queryByText('Memory Alert')).not.toBeInTheDocument();
  });

  it('should filter alerts by service type', () => {
    const alerts = [
      notificationChannelAlertsFactory.build({
        label: 'Database Alert 1',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Database Alert 2',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Linode Alert',
        service_type: 'linode',
      }),
    ];

    const serviceFilters: Item<string, CloudPulseServiceType>[] = [
      { label: 'Databases', value: 'dbaas' },
    ];
    const filteredAlerts = getAssociatedAlerts(alerts, serviceFilters, '');

    const alertsWithServiceLabel = filteredAlerts.map((alert) => ({
      ...alert,
      service_type_label: mockServiceTypes.find(
        (st) => st.service_type === alert.service_type
      )?.label,
    }));

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      error: undefined,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alertsWithServiceLabel,
    });

    const { getByText, queryByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText('Database Alert 1')).toBeVisible();
    expect(getByText('Database Alert 2')).toBeVisible();
    expect(queryByText('Linode Alert')).not.toBeInTheDocument();
  });

  it('should filter alerts by both search text and service type', () => {
    const alerts = [
      notificationChannelAlertsFactory.build({
        label: 'Database CPU Alert',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Database Memory Alert',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Linode CPU Alert',
        service_type: 'linode',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Linode Memory Alert',
        service_type: 'linode',
      }),
    ];

    const serviceFilters: Item<string, CloudPulseServiceType>[] = [
      { label: 'Databases', value: 'dbaas' },
    ];
    const filteredAlerts = getAssociatedAlerts(alerts, serviceFilters, 'cpu');

    const alertsWithServiceLabel = filteredAlerts.map((alert) => ({
      ...alert,
      service_type_label: mockServiceTypes.find(
        (st) => st.service_type === alert.service_type
      )?.label,
    }));

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      error: undefined,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alertsWithServiceLabel,
    });

    const { getByText, queryByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );

    expect(getByText('Database CPU Alert')).toBeVisible();
    expect(queryByText('Database Memory Alert')).not.toBeInTheDocument();
    expect(queryByText('Linode CPU Alert')).not.toBeInTheDocument();
    expect(queryByText('Linode Memory Alert')).not.toBeInTheDocument();
  });
  it('should render the Beta flag for the services in the service column', async () => {
    const alerts = [
      notificationChannelAlertsFactory.build({
        label: 'Database CPU Alert',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Database Memory Alert',
        service_type: 'dbaas',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Linode CPU Alert',
        service_type: 'linode',
      }),
      notificationChannelAlertsFactory.build({
        label: 'Linode Memory Alert',
        service_type: 'linode',
      }),
    ];

    const alertsWithServiceLabel = alerts.map((alert) => ({
      ...alert,
      service_type_label: mockServiceTypes.find(
        (st) => st.service_type === alert.service_type
      )?.label,
    }));

    queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: alerts,
      error: undefined,
      isError: false,
      isLoading: false,
    });

    hookMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
      sortedData: alertsWithServiceLabel,
    });

    const { getAllByText } = renderWithTheme(
      <NotificationChannelAlerts channelId={1} />,
      {
        flags: mockFlags,
      }
    );
    expect(getAllByText(/beta/i)).toHaveLength(alerts.length);
  });
});
