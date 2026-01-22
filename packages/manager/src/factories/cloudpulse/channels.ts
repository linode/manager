import { Factory } from '@linode/utilities';

import type {
  NotificationChannel,
  NotificationChannelAlerts,
} from '@linode/api-v4';

export const notificationChannelFactory =
  Factory.Sync.makeFactory<NotificationChannel>({
    alerts: {
      type: 'alerts-definitions',
      alert_count: 1,
      url: 'monitor/alert-channels/{id}/alerts',
    },
    channel_type: 'email',
    content: {
      email: {
        email_addresses: ['test@test.com', 'test2@test.com'],
        message: 'You have a new Alert',
        subject: 'Sample Alert',
      },
    },
    created: new Date().toISOString(),
    created_by: 'user1',
    id: Factory.each((i) => i),
    label: Factory.each((id) => `Channel-${id}`),
    status: 'Enabled',
    type: 'user',
    updated: new Date().toISOString(),
    updated_by: 'user1',
  });

export const notificationChannelAlertsFactory =
  Factory.Sync.makeFactory<NotificationChannelAlerts>({
    type: 'alerts-definitions',
    id: Factory.each((i) => i),
    service_type: 'linode',
    label: Factory.each((id) => `Alert-${id}`),
    url: Factory.each((i) => `monitor/alert-definitions/${i}`),
  });
