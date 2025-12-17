import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelListing } from './NotificationChannelListing';

const queryMocks = vi.hoisted(() => ({
  useAllAlertNotificationChannelsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAllAlertNotificationChannelsQuery:
      queryMocks.useAllAlertNotificationChannelsQuery,
  };
});

const mockNotificationChannels = notificationChannelFactory.buildList(3);

describe('NotificationChannelListing', () => {
  beforeEach(() => {
    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: mockNotificationChannels,
      error: null,
      isLoading: false,
    });
  });

  it('should render the notification channel listing with search field', () => {
    renderWithTheme(<NotificationChannelListing />);

    expect(
      screen.getByPlaceholderText('Search for Notification Channels')
    ).toBeVisible();
  });

  it('should render the notification channels table', () => {
    renderWithTheme(<NotificationChannelListing />);

    expect(screen.getByText('Channel Name')).toBeVisible();
    expect(screen.getByText('Alerts')).toBeVisible();
    expect(screen.getByText('Channel Type')).toBeVisible();
    expect(screen.getByText('Created By')).toBeVisible();
    expect(screen.getByText('Last Modified')).toBeVisible();
    expect(screen.getByText('Last Modified By')).toBeVisible();
  });

  it('should render notification channel rows', () => {
    renderWithTheme(<NotificationChannelListing />);

    mockNotificationChannels.forEach((channel) => {
      expect(screen.getByText(channel.label)).toBeVisible();
    });
  });

  it('should filter notification channels based on search text', async () => {
    const channels = [
      notificationChannelFactory.build({ label: 'Email Channel' }),
      notificationChannelFactory.build({ label: 'Slack Channel' }),
      notificationChannelFactory.build({ label: 'PagerDuty Channel' }),
    ];

    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: channels,
      error: null,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelListing />);

    const searchField = screen.getByPlaceholderText(
      'Search for Notification Channels'
    );

    await userEvent.type(searchField, 'Email');

    // Wait for debounce
    await vi.waitFor(() => {
      expect(screen.getByText('Email Channel')).toBeVisible();
      expect(screen.queryByText('Slack Channel')).not.toBeInTheDocument();
      expect(screen.queryByText('PagerDuty Channel')).not.toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithTheme(<NotificationChannelListing />);

    screen.getByTestId('table-row-loading');
  });

  it('should show error state', () => {
    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'Error in fetching the notification channels' }],
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelListing />);

    expect(
      screen.getByText('Error in fetching the notification channels')
    ).toBeVisible();
  });

  it('should render empty table when no notification channels exist', () => {
    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });

    renderWithTheme(<NotificationChannelListing />);

    expect(screen.getByText('Channel Name')).toBeVisible();
    expect(screen.getByText('No data to display.')).toBeVisible();
  });
});
