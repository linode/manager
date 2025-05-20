import type { Notification } from '@linode/api-v4/lib/account';

export const mockNotification: Notification = {
  body: null,
  entity: {
    id: 8675309,
    label: 'my-linode',
    type: 'linode',
    url: 'doesnt/matter/',
  },
  label: "Here's a notification!",
  message: 'Something something... whatever.',
  severity: 'major',
  type: 'migration_pending',
  until: null,
  when: null,
};

export const abuseTicketNotification: Notification = {
  body: null,
  entity: {
    id: 123456,
    label: 'Abuse Ticket',
    type: 'ticket',
    url: '/support/tickets/123456 ',
  },
  label: 'You have an open abuse ticket!',
  message: 'You have an open abuse ticket!',
  severity: 'major',
  type: 'ticket_abuse',
  until: null,
  when: null,
};
