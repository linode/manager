import Factory from 'src/factories/factoryProxy';

import type { NotificationChannel } from '@linode/api-v4';

export const notificationChannelFactory = Factory.Sync.makeFactory<NotificationChannel>(
  {
    alerts: [
      {
        id: Number(Factory.each((i) => i)),
        label: String(Factory.each((id) => `Alert-${id}`)),
        type: 'alerts-definitions',
        url: 'Sample',
      },
    ],
    channel_type: 'email',
    content: {
      email: {
        email_addresses: ['test@test.com', 'test2@test.com'],
        message: 'You have a new Alert',
        subject: 'Sample Alert',
      },
    },
    created_at: new Date().toISOString(),
    created_by: 'user1',
    id: Factory.each((i) => i),
    label: Factory.each((id) => `Channel-${id}`),
    status: 'Enabled',
    type: 'custom',
    updated_at: new Date().toISOString(),
    updated_by: 'user1',
  }
);
