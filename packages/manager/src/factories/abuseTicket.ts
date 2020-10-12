import * as Factory from 'factory.ts';
import { Notification, Entity } from '@linode/api-v4/lib/account';

const generateEntity = (id: number): Entity => ({
  type: 'ticket',
  label: 'test',
  id,
  url: `/support/tickets/${id}`
});

export const abuseTicketFactory = Factory.Sync.makeFactory<Notification>({
  type: 'ticket_abuse',
  entity: Factory.each(i => generateEntity(i)),
  when: null,
  message: 'You have an open abuse ticket!',
  label: 'You have an open abuse ticket!',
  severity: 'major',
  until: null,
  body: null
});
