export const mockNotification: Linode.Notification = {
  entity: {
    url: 'doesnt/matter/',
    type: 'linode',
    label: 'my-linode',
    id: 8675309
  },
  label: "Here's a notification!",
  message: 'Something something... whatever.',
  severity: 'major',
  when: null,
  until: null,
  body: null,
  type: 'migration_pending'
};

export const abuseTicketNotification: Linode.Notification = {
  type: 'ticket_abuse',
  body: null,
  severity: 'major',
  until: null,
  entity: {
    url: '/support/tickets/123456 ',
    type: 'ticket',
    id: 123456,
    label: 'Abuse Ticket'
  },
  label: 'You have an open abuse ticket!',
  when: null,
  message: 'You have an open abuse ticket!'
};
