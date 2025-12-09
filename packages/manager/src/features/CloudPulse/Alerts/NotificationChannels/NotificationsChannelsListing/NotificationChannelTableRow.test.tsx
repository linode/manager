import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { NotificationChannelTableRow } from './NotificationChannelTableRow';

describe('NotificationChannelTableRow', () => {
  it('should render a notification channel row with all fields', () => {
    const updated = new Date().toISOString();
    const channel = notificationChannelFactory.build({
      alerts: [
        { id: 1, label: 'Alert 1', type: 'alerts-definitions', url: 'url1' },
        { id: 2, label: 'Alert 2', type: 'alerts-definitions', url: 'url2' },
      ],
      channel_type: 'email',
      created_by: 'user1',
      label: 'Test Channel',
      updated_by: 'user2',
      updated,
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('Test Channel')).toBeVisible();
    expect(screen.getByText('2')).toBeVisible(); // alerts count
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

  it('should render channel type as Email for email type', () => {
    const channel = notificationChannelFactory.build({
      channel_type: 'email',
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('Email')).toBeVisible();
  });

  it('should render channel type as Slack for slack type', () => {
    const channel = notificationChannelFactory.build({
      channel_type: 'slack',
      content: {
        slack: {
          message: 'message',
          slack_channel: 'channel',
          slack_webhook_url: 'url',
        },
      },
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('Slack')).toBeVisible();
  });

  it('should render channel type as PagerDuty for pagerduty type', () => {
    const channel = notificationChannelFactory.build({
      channel_type: 'pagerduty',
      content: {
        pagerduty: {
          attributes: [],
          description: 'desc',
          service_api_key: 'key',
        },
      },
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('PagerDuty')).toBeVisible();
  });

  it('should render channel type as Webhook for webhook type', () => {
    const channel = notificationChannelFactory.build({
      channel_type: 'webhook',
      content: {
        webhook: {
          http_headers: [],
          webhook_url: 'url',
        },
      },
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('Webhook')).toBeVisible();
  });

  it('should render zero alerts count when no alerts are associated', () => {
    const channel = notificationChannelFactory.build({
      alerts: [],
    });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText('0')).toBeVisible();
  });

  it('should render row with correct data-qa attribute', () => {
    const channel = notificationChannelFactory.build({ id: 123 });

    renderWithTheme(
      wrapWithTableBody(
        <NotificationChannelTableRow notificationChannel={channel} />
      )
    );

    expect(screen.getByText(channel.label)).toBeVisible();
  });
});
