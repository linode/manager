import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelDetail } from './NotificationChannelDetail';

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertsByNotificationChannelIdQuery: vi.fn(),
  useAllAlertDefinitionsQuery: vi.fn(),
  useNotificationChannelQuery: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertsByNotificationChannelIdQuery:
    queryMocks.useAlertsByNotificationChannelIdQuery,
  useAllAlertDefinitionsQuery: queryMocks.useAllAlertDefinitionsQuery,
  useNotificationChannelQuery: queryMocks.useNotificationChannelQuery,
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
  queryMocks.useParams.mockReturnValue({
    channelId: '1',
  });

  queryMocks.useAlertsByNotificationChannelIdQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
  });

  queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
  });
});

const route = '/alerts/notification-channels/detail/1';
describe('NotificationChannelDetail component tests', () => {
  it('should render the error state on channel API call failure', async () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute: route,
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
      initialRoute: route,
    });

    expect(getByTestId('circle-progress')).toBeVisible();
  });

  it('should render breadcrumbs correctly', () => {
    const channelDetails = notificationChannelFactory.build({
      id: 1,
      label: 'Test Channel',
    });

    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelDetails,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute: route,
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

    queryMocks.useAlertsByNotificationChannelIdQuery.mockReturnValue({
      data: [{ id: 100 }],
      isError: false,
      isLoading: false,
    });

    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: [
        {
          id: 100,
          label: 'Critical CPU Alert',
          service_type: 'linode',
          updated: '2024-12-15T10:00:00Z',
        },
      ],
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelDetail />, {
      initialRoute: route,
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
  });
});
