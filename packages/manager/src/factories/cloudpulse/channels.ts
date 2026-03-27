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
    details: {
      email: {
        recipient_type: 'user',
        usernames: ['test@test.com', 'test2@test.com'],
      },
    },
    channel_type: 'email',
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
