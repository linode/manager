import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelListTable } from './NotificationChannelListTable';

const mockScrollToElement = vi.fn();

const ALERT_TYPE = 'alerts-definitions';

describe('NotificationChannelListTable', () => {
  it('should render the notification channel table headers', () => {
    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[]}
        scrollToElement={mockScrollToElement}
      />
    );

    expect(screen.getByText('Channel Name')).toBeVisible();
    expect(screen.getByText('Alerts')).toBeVisible();
    expect(screen.getByText('Channel Type')).toBeVisible();
    expect(screen.getByText('Created By')).toBeVisible();
    expect(screen.getByText('Last Modified')).toBeVisible();
    expect(screen.getByText('Last Modified By')).toBeVisible();
  });

  it('should render the error message when error is provided', () => {
    renderWithTheme(
      <NotificationChannelListTable
        error={[{ reason: 'Error in fetching the notification channels' }]}
        isLoading={false}
        notificationChannels={[]}
        scrollToElement={mockScrollToElement}
      />
    );

    expect(
      screen.getByText('Error in fetching the notification channels')
    ).toBeVisible();
  });

  it('should render notification channel rows', () => {
    const updated = new Date().toISOString();
    const channel = notificationChannelFactory.build({
      channel_type: 'email',
      created_by: 'user1',
      label: 'Test Channel',
      updated_by: 'user2',
      updated,
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    expect(screen.getByText('Test Channel')).toBeVisible();
    expect(screen.getByText('Email')).toBeVisible();
    expect(screen.getByText('user1')).toBeVisible();
    expect(screen.getByText('user2')).toBeVisible();
    expect(
      screen.getByText(
        formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
        })
      )
    ).toBeVisible();
  });

  it('should render the loading state', () => {
    renderWithTheme(
      <NotificationChannelListTable
        isLoading={true}
        notificationChannels={[]}
        scrollToElement={mockScrollToElement}
      />
    );

    screen.getByTestId('table-row-loading');
  });

  it('should render tooltip for Alerts column', async () => {
    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[]}
        scrollToElement={mockScrollToElement}
      />
    );

    const tooltipIcon = screen.getByTestId('tooltip-info-icon');
    await userEvent.hover(tooltipIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          'The number of alert definitions associated with the notification channel.'
        )
      ).toBeVisible();
    });
  });

  it('should render multiple notification channels', () => {
    const channels = notificationChannelFactory.buildList(5);

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={channels}
        scrollToElement={mockScrollToElement}
      />
    );

    channels.forEach((channel) => {
      expect(screen.getByText(channel.label)).toBeVisible();
    });
  });

  it('should display correct alerts count', () => {
    const channel = notificationChannelFactory.build({
      alerts: [
        { id: 1, label: 'Alert 1', type: ALERT_TYPE, url: 'url1' },
        { id: 2, label: 'Alert 2', type: ALERT_TYPE, url: 'url2' },
        { id: 3, label: 'Alert 3', type: ALERT_TYPE, url: 'url3' },
      ],
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    expect(screen.getByText('3')).toBeVisible();
  });

  it('should render pagination footer', () => {
    const channels = notificationChannelFactory.buildList(30);

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={channels}
        scrollToElement={mockScrollToElement}
      />
    );

    screen.getByRole('button', { name: /next/i });
  });
});
