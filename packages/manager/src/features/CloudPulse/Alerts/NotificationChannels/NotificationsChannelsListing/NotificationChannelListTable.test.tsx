import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertDefinitionFactory } from 'src/factories';
import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  DELETE_CHANNEL_FAILED_MESSAGE,
  DELETE_CHANNEL_SUCCESS_MESSAGE,
  DELETE_CHANNEL_TOOLTIP_TEXT,
} from '../../constants';
import { NotificationChannelListTable } from './NotificationChannelListTable';

const mockScrollToElement = vi.fn();

const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useDeleteNotificationChannel: vi.fn(() => ({
      mutateAsync: queryMocks.mutateAsync,
    })),
  };
});

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

  it('should not show delete action for system channels', async () => {
    const channel = notificationChannelFactory.build({
      type: 'system',
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    const actionMenu = screen.getByRole('button', {
      name: `Action menu for Notification Channel ${channel.label}`,
    });

    await userEvent.click(actionMenu);
    expect(screen.queryByTestId('Delete')).not.toBeInTheDocument();
  });

  it('should disable delete if the user channel has alerts and show tooltip', async () => {
    const channel = notificationChannelFactory.build({
      alerts: alertDefinitionFactory.buildList(3),
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    const actionMenu = screen.getByRole('button', {
      name: `Action menu for Notification Channel ${channel.label}`,
    });

    await userEvent.click(actionMenu);
    expect(screen.getByTestId('Delete')).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    const tooltip = screen.getByLabelText(DELETE_CHANNEL_TOOLTIP_TEXT);
    expect(tooltip).toBeInTheDocument();
  });

  it('should open delete confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup();
    const channel = notificationChannelFactory.build({
      label: 'test_channel',
      alerts: [],
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: `Action menu for Notification Channel ${channel.label}`,
      })
    );
    await user.click(screen.getByText('Delete'));

    expect(screen.getByText(`Delete ${channel.label}?`)).toBeVisible();
  });

  it('should show success snackbar when deleting notification channel succeeds', async () => {
    queryMocks.mutateAsync.mockResolvedValue({});
    const user = userEvent.setup();
    const channel = notificationChannelFactory.build({
      label: 'Channel to be deleted',
      alerts: [],
    });

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: `Action menu for Notification Channel ${channel.label}`,
      })
    );
    await user.click(screen.getByText('Delete'));

    expect(screen.getByText(`Delete ${channel.label}?`)).toBeVisible();

    // Type the channel label to confirm
    const input = screen.getByLabelText('Notification Channel Label');
    await user.type(input, channel.label);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText(DELETE_CHANNEL_SUCCESS_MESSAGE)).toBeVisible();
  });

  it('should show error snackbar when deleting notification channel fails', async () => {
    const user = userEvent.setup();
    const channel = notificationChannelFactory.build({
      label: 'Channel to be deleted',
      alerts: [],
    });

    queryMocks.mutateAsync.mockRejectedValue([
      { reason: DELETE_CHANNEL_FAILED_MESSAGE },
    ]);

    renderWithTheme(
      <NotificationChannelListTable
        isLoading={false}
        notificationChannels={[channel]}
        scrollToElement={mockScrollToElement}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: `Action menu for Notification Channel ${channel.label}`,
      })
    );
    await user.click(screen.getByText('Delete'));

    expect(screen.getByText(`Delete ${channel.label}?`)).toBeVisible();

    // Type the channel label to confirm
    const input = screen.getByLabelText('Notification Channel Label');
    await user.type(input, channel.label);
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText(DELETE_CHANNEL_FAILED_MESSAGE)).toBeVisible();
  });
});
