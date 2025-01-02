import Factory from 'src/factories/factoryProxy';
import { pickRandom } from 'src/utilities/random';

import type { NotificationChannel } from '@linode/api-v4';

export const notificationChannelFactory = Factory.Sync.makeFactory<NotificationChannel>(
  {
    alerts: {
      id: Number(Factory.each(() => Math.floor(Math.random() * 1000000))),
      label: String(Factory.each((id) => `Alert-${id}`)),
      type: 'alerts-definitions',
      url: 'Sample',
    },

    channel_type: 'email',
    content: {
      channel_type: {
        email_addresses: ['test@test.com', 'test2@test.com'],
        message: 'You have a new Alert',
        subject: 'Sample Alert',
      },
    },
    created_at: new Date().toISOString(),
    created_by: Factory.each(() => pickRandom(['user1', 'user2', 'user3'])),
    id: Factory.each(() => Math.floor(Math.random() * 1000000)),
    label: Factory.each((id) => `Channel-${id}`),
    status: 'Enabled',
    type: 'custom',
    updated_at: new Date().toISOString(),
    updated_by: Factory.each(() => pickRandom(['user1', 'user2', 'user3'])),
  }
);
