import type { ManagedIssue } from '@linode/api-v4';

export const managedIssues: ManagedIssue[] = [
  {
    created: '2019-09-11T20:00:00',
    entity: {
      id: 123456,
      label: 'Managed Monitoring Issue - failingmonitor',
      type: 'ticket',
      url: '/support/tickets/12597521',
    },
    id: 111111,
    services: [8750],
  },
  {
    created: '2019-09-12T20:00:00',
    entity: {
      id: 123456,
      label: 'Managed Monitoring Issue - failingmonitor',
      type: 'ticket',
      url: '/support/tickets/12597521',
    },
    id: 111112,
    services: [8750],
  },
  {
    created: '2019-09-13T20:00:00',
    entity: {
      id: 123456,
      label: 'Managed Monitoring Issue - failingmonitor',
      type: 'ticket',
      url: '/support/tickets/12597521',
    },
    id: 111113,
    services: [8750],
  },
];
