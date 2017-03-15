export const testTicket = {
  summary: 'This is my ticket!',
  opened: '2017-03-03T01:22:32',
  opened_by: 'tdude',
  updated: '2017-03-03T01:22:32',
  updated_by: 'tdude',
  id: 1,
  status: 'new',
  closed_by: 'tdude',
  description: 'Hullo!',
  closed: null,
  entity: {
    label: 'awkward-aimless-alpha-22',
    type: 'linode',
  },
};

export const tickets = {
  [testTicket.id]: testTicket,
};
