import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditChannelLanding } from './EditChannelLanding';

const NOTIFICATION_CHANNELS_TEXT = 'Notification Channels';
const EDIT_CHANNEL_ROUTE = '/alerts/notification-channels/edit/1';

const channelData = notificationChannelFactory.build({
  id: 1,
  label: 'Test Channel',
});

const queryMocks = vi.hoisted(() => ({
  useNotificationChannelQuery: vi.fn(),
  useParams: vi.fn(),
  useUpdateNotificationChannel: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useNotificationChannelQuery: queryMocks.useNotificationChannelQuery,
  useUpdateNotificationChannel: queryMocks.useUpdateNotificationChannel,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('EditChannelLanding component tests', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      channelId: 1,
    });
    queryMocks.useUpdateNotificationChannel.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      reset: vi.fn(),
    });
  });

  it('should render loading state when data is loading', () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelData,
      isError: false,
      isLoading: true,
    });

    renderWithTheme(<EditChannelLanding />, {
      initialRoute: EDIT_CHANNEL_ROUTE,
    });

    expect(screen.getByText(NOTIFICATION_CHANNELS_TEXT)).toBeVisible();
    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('should render error state when there is an error loading the channel', () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelData,
      isError: true,
      isLoading: false,
    });

    renderWithTheme(<EditChannelLanding />, {
      initialRoute: EDIT_CHANNEL_ROUTE,
    });

    expect(screen.getByText(NOTIFICATION_CHANNELS_TEXT)).toBeVisible();
    expect(
      screen.getByText(
        'An error occurred while loading the notification channel. Please try again later.'
      )
    ).toBeVisible();
  });

  it('should render empty state when channel data is not available', () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: null,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<EditChannelLanding />, {
      initialRoute: EDIT_CHANNEL_ROUTE,
    });

    expect(screen.getByText(NOTIFICATION_CHANNELS_TEXT)).toBeVisible();
    expect(screen.getByText('No Data to display.')).toBeVisible();
  });

  it('should render EditNotificationChannel when channel data is successfully loaded', () => {
    queryMocks.useNotificationChannelQuery.mockReturnValue({
      data: channelData,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(<EditChannelLanding />, {
      initialRoute: EDIT_CHANNEL_ROUTE,
    });

    expect(screen.getByText(NOTIFICATION_CHANNELS_TEXT)).toBeVisible();
    expect(screen.getByText('Channel Settings')).toBeVisible();
  });
});
