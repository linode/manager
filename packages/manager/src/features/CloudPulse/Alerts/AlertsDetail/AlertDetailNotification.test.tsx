import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertDetailNotification } from './AlertDetailNotification';

const notificationChannels = notificationChannelFactory.buildList(3, {
  content: {
    email: {
      email_addresses: ['1@test.com', '2@test.com'],
    },
  },
});

const queryMocks = vi.hoisted(() => ({
  useAllAlertNotificationChannelsQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAllAlertNotificationChannelsQuery:
    queryMocks.useAllAlertNotificationChannelsQuery,
}));

beforeEach(() => {
  queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
    data: notificationChannels,
    isError: false,
    isFetching: false,
  });
});

describe('AlertDetailNotification component tests', () => {
  it('should render the alert detail notification channels successfully', () => {
    const { getAllByText, getByText } = renderWithTheme(
      <AlertDetailNotification channelIds={['1', '2', '3']} />
    );

    expect(getByText('Notification Channels')).toBeInTheDocument();
    expect(getAllByText('Email').length).toBe(notificationChannels.length);
    expect(getAllByText('1@test.com').length).toBe(notificationChannels.length);
    expect(getAllByText('2@test.com').length).toBe(notificationChannels.length);

    notificationChannels.forEach((channel) => {
      expect(getByText(channel.label)).toBeInTheDocument();
    });
  });
  it('should render the error state if api throws error', () => {
    queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
      data: makeResourcePage(notificationChannels),
      isError: true,
      isFetching: false,
    });
    const { getByText } = renderWithTheme(
      <AlertDetailNotification channelIds={['1', '2', '3']} />
    );

    expect(getByText('Notification Channels')).toBeInTheDocument();
    expect(
      getByText('Failed to load notification channels.')
    ).toBeInTheDocument();
  });
});
