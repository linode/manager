import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelDetail } from './NotificationChannelDetail';

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAllAlertsByNotificationChannelIdQuery: vi.fn(),
  useCloudPulseServiceTypes: vi.fn(),
  useNotificationChannelQuery: vi.fn(),
  useParams: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
  useOrderV2: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAllAlertsByNotificationChannelIdQuery:
    queryMocks.useAllAlertsByNotificationChannelIdQuery,
  useNotificationChannelQuery: queryMocks.useNotificationChannelQuery,
}));

vi.mock('src/queries/cloudpulse/services', () => ({
  useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
}));

vi.mock('src/hooks/useOrderV2', () => ({
  useOrderV2: hookMocks.useOrderV2,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

// Shared Setup
const initialRoute = '/alerts/notification-channels/detail/1';

beforeEach(() => {
  queryMocks.useParams.mockReturnValue({
    channelId: '1',
  });

  queryMocks.useAllAlertsByNotificationChannelIdQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
  });

  queryMocks.useCloudPulseServiceTypes.mockReturnValue({
    data: { data: [] },
    isFetching: false,
  });

  hookMocks.useOrderV2.mockReturnValue({
    handleOrderChange: vi.fn(),
    order: 'asc',
    orderBy: 'label',
    sortedData: [],
  });
});

describe('NotificationChannelDetail component tests', () => {
  it('should render the error state on channel API call failure', async () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute,
    });

    // Assert error message is displayed
    expect(
      screen.getByText(
        'An error occurred while loading the notification channel. Please try again later.'
      )
    ).toBeVisible();
  });

  it('should render the loading state when API call is fetching', async () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: null,
      isError: false,
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(<NotificationChannelDetail />, {
      initialRoute,
    });

    expect(getByTestId('circle-progress')).toBeVisible();
  });

  it('should render breadcrumbs correctly', () => {
    const channelDetails = notificationChannelFactory.build({
      id: 1,
      label: 'Test Channel',
      details: {
        email: { recipient_type: 'user', usernames: ['user1', 'user2'] },
      },
    });

    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelDetails,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute,
    });
    const link = screen.getByTestId('link-text');
    expect(link).toBeVisible();
    expect(link).toHaveTextContent('Notification Channels');
    const breadcrumbLink = screen.getByRole('link', {
      name: /notification channels/i,
    });
    expect(breadcrumbLink).toHaveAttribute(
      'href',
      '/alerts/notification-channels'
    );
  });

  it('should render all the details properly', async () => {
    const channelDetails = notificationChannelFactory.build({
      channel_type: 'email',
      created_by: 'admin_user',
      details: {
        email: {
          usernames: ['admin', 'ops_team'],
        },
      },
      id: 1,
      label: 'Email Notifications',
      type: 'user',
      updated_by: 'ops_user',
    });

    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelDetails,
      isError: false,
      isLoading: false,
    });

    const alerts = [
      {
        id: 200,
        label: 'Critical CPU Alert',
        service_type: 'linode',
      },
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

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute,
    });

    // Verify Overview section details
    expect(screen.getByText('Overview')).toBeVisible();
    expect(screen.getByText('Email Notifications')).toBeVisible();
    expect(screen.getByText('Email')).toBeVisible();
    expect(screen.getByText('admin_user')).toBeVisible();
    expect(screen.getByText('ops_user')).toBeVisible();

    // Verify Settings/Recipients section details
    expect(screen.getByText('Settings')).toBeVisible();
    expect(screen.getByText(/Recipients/)).toBeVisible();
    expect(screen.getByText('admin')).toBeVisible();
    expect(screen.getByText('ops_team')).toBeVisible();
    expect(screen.getByText('Associated Alerts')).toBeVisible();
    expect(screen.getByText('Critical CPU Alert')).toBeVisible();
  });
});
