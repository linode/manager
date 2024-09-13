import {
  createSupportTicket,
  //   getSupportTicket,
  getSupportTicketReplies,
  getSupportTickets,
} from 'src/mocks/presets/crud/handlers/supportTickets';

import type { MockPresetCrud } from 'src/mocks/types';

export const supportTicketCrudPreset: MockPresetCrud = {
  group: { id: 'Support Tickets' },
  handlers: [
    createSupportTicket,
    // getSupportTicket,
    getSupportTickets,
    getSupportTicketReplies,
  ],
  id: 'support-tickets:crud',
  label: 'Support Tickets CRUD',
};
