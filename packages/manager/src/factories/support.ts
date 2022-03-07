import * as Factory from 'factory.ts';
import { SupportTicket, SupportReply } from '@linode/api-v4/lib/support/types';

export const supportTicketFactory = Factory.Sync.makeFactory<SupportTicket>({
  updated_by: 'test-account',
  closed: null,
  attachments: [],
  summary: Factory.each((i) => `TEST Support Ticket ${i}`),
  gravatar_id: '0',
  closable: false,
  id: Factory.each((i) => i),
  status: 'new',
  description: 'TEST support ticket body',
  opened_by: 'test-account',
  entity: null,
  opened: '2018-11-01T01:00:00',
  updated: '2018-11-01T01:00:00',
});

export const supportReplyFactory = Factory.Sync.makeFactory<SupportReply>({
  id: Factory.each((i) => i),
  description: "Support reporting in - here's a reply :)",
  created_by: 'support-staff',
  created: '2019-04-02T12:37:47',
  gravatar_id: 'xxxxx',
  from_linode: true,
});
