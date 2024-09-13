import {
  closeSupportTicket,
  createSupportTicket,
  getSupportTicketReplies,
  getSupportTickets,
} from 'src/mocks/presets/crud/handlers/supportTickets';

import type { MockPresetCrud } from 'src/mocks/types';

export const supportTicketCrudPreset: MockPresetCrud = {
  group: { id: 'Support Tickets' },
  handlers: [
    createSupportTicket,
    closeSupportTicket,
    getSupportTickets,
    getSupportTicketReplies,
  ],
  id: 'support-tickets:crud',
  label: 'Support Tickets CRUD',
};
