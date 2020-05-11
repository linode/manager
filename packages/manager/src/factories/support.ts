import * as Factory from 'factory.ts';
import { SupportTicket } from 'linode-js-sdk/lib/support/types';

export const supportTicketFactory = Factory.Sync.makeFactory<SupportTicket>({
  updated_by: 'test-account',
  closed: null,
  attachments: [],
  summary: 'TEST Support Ticket',
  gravatar_id: '0',
  closable: false,
  id: 0,
  status: 'new',
  description: 'TEST support ticket body',
  opened_by: 'test-account',
  entity: null,
  opened: '2018-11-01T01:00:00',
  updated: '2018-11-01T01:00:00'
});
