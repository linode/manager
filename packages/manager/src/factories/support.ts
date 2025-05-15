import { Factory } from '@linode/utilities';

import type {
  SupportReply,
  SupportTicket,
} from '@linode/api-v4/lib/support/types';

export const supportTicketFactory = Factory.Sync.makeFactory<SupportTicket>({
  attachments: [],
  closable: false,
  closed: null,
  description: 'TEST support ticket body',
  entity: null,
  gravatar_id: '0',
  id: Factory.each((i) => i),
  opened: '2018-11-01T01:00:00',
  opened_by: 'test-account',
  severity: null,
  status: 'new',
  summary: Factory.each((i) => `TEST Support Ticket ${i}`),
  updated: '2018-11-01T01:00:00',
  updated_by: 'test-account',
});

export const supportReplyFactory = Factory.Sync.makeFactory<SupportReply>({
  created: '2019-04-02T12:37:47',
  created_by: 'support-staff',
  description: "Support reporting in - here's a reply :)",
  friendly_name: 'Lucy',
  from_linode: true,
  gravatar_id: 'xxxxx',
  id: Factory.each((i) => i),
});
