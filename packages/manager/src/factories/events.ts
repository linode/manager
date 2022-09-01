import * as Factory from 'factory.ts';
import { Entity, Event } from '@linode/api-v4/lib/account/types';
import { DateTime } from 'luxon';

export const entityFactory = Factory.Sync.makeFactory<Entity>({
  id: Factory.each((id) => id),
  label: Factory.each((i) => `event-entity-${i}`),
  type: 'linode',
  url: 'https://www.example.com',
});

export const eventFactory = Factory.Sync.makeFactory<Event>({
  id: Factory.each((id) => id),
  created: DateTime.local().toISO(),
  entity: {
    id: 1,
    label: 'my-linode',
    type: 'linode',
    url: '/v4/linode/instances/30499244',
  },
  secondary_entity: {
    id: 1,
    label: 'My Config',
    type: 'linode_config',
    url: '/v4/linode/instances/1/configs/1',
  },
  status: 'started',
  rate: null,
  username: 'prod-test-001',
  seen: false,
  read: false,
  action: 'linode_boot',
  percent_complete: 10,
  time_remaining: null,
  duration: 0,
  message: null,
});
