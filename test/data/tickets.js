const replies = [
  {
    description: 'This is the first response.',
    created: '2017-03-30T16:48:10',
    id: 1,
    created_by: 'support',
  },
];

function createTestTicket(id) {
  return {
    summary: 'This is my ticket!',
    opened: '2017-03-03T01:22:32',
    opened_by: 'tdude',
    updated: '2017-03-03T01:22:32',
    updated_by: 'tdude',
    id: id,
    status: 'new',
    closed_by: 'tdude',
    description: 'Hullo!',
    closed: null,
    entity: {
      label: 'awkward-aimless-alpha-22',
      type: 'linode',
    },
    _replies: { replies },
  };
}

export const testTicket = createTestTicket(1);
export const closedTicket = {
  ...createTestTicket(testTicket.id),
  status: 'closed',
};

export const tickets = {
  [testTicket.id]: testTicket,
  [closedTicket.id]: closedTicket,
};
