import { Factory } from '@linode/utilities';
import { DateTime } from 'luxon';

import type { Entity, Event } from '@linode/api-v4/lib/account/types';

export const entityFactory = Factory.Sync.makeFactory<Entity>({
  id: Factory.each((id) => id),
  label: Factory.each((i) => `event-entity-${i}`),
  type: 'linode',
  url: 'https://www.example.com',
});

export const eventFactory = Factory.Sync.makeFactory<Event>({
  action: 'linode_boot',
  created: DateTime.local().toISO(),
  duration: 0,
  entity: {
    id: 1,
    label: 'my-linode',
    type: 'linode',
    url: '/v4/linode/instances/30499244',
  },
  id: Factory.each((id) => id),
  message: null,
  percent_complete: 10,
  rate: null,
  read: false,
  secondary_entity: {
    id: 1,
    label: 'My Config',
    type: 'linode_config',
    url: '/v4/linode/instances/1/configs/1',
  },
  seen: false,
  status: 'started',
  time_remaining: null,
  username: 'prod-test-001',
});
