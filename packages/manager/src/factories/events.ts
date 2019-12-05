import * as Factory from 'factory.ts';
import { Entity, Event } from 'linode-js-sdk/lib/account/types';

export const entityFactory = Factory.Sync.makeFactory<Entity>({
  id: Factory.each(id => id),
  label: Factory.each(i => `event-entity-${i}`),
  type: 'linode',
  url: 'https://www.example.com'
});

export const eventFactory = Factory.Sync.makeFactory<Event>({
  id: Factory.each(id => id),
  created: new Date().toDateString(),
  entity: null,
  secondary_entity: null,
  status: 'started',
  rate: null,
  username: 'prod-test-001',
  seen: false,
  read: false,
  action: 'linode_boot',
  percent_complete: 10,
  time_remaining: 0
});
