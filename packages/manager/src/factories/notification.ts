import { Entity, Notification } from '@linode/api-v4/lib/account';
import Factory from 'src/factories/factoryProxy';
import { DateTime } from 'luxon';

const generateEntity = (
  id: number,
  url: string = 'linode/instances'
): Entity => ({
  id,
  label: `linode-${id}`,
  type: 'linode',
  url: `/${url}/${id}`,
});

export const notificationFactory = Factory.Sync.makeFactory<Notification>({
  body:
    'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
  entity: Factory.each((i) => generateEntity(i)),
  label: 'maintenance',
  message: 'This Linode will be affected by critical maintenance!',
  severity: 'critical',
  type: 'maintenance',
  until: null,
  when: DateTime.local().plus({ days: 7 }).toISODate(),
});

export const abuseTicketNotificationFactory = notificationFactory.extend({
  body: null,
  entity: Factory.each((i) => generateEntity(i, 'support/tickets')),
  label: 'You have an open abuse ticket!',
  message: 'You have an open abuse ticket!',
  severity: 'major',
  type: 'ticket_abuse',
  until: null,
  when: null,
});

export const gdprComplianceNotification = notificationFactory.extend({
  entity: null,
  label: "We've updated our policies",
  // safe
  message:
    "We've updated our policies. See <a href='https://www.linode.com/eu-model/'>https://www.linode.com/eu-model/</a> for more information.",
  severity: 'major',
  type: 'notice',
  until: null,
  when: null,
});
