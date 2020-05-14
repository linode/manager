import { Entity } from 'src/account/types';
export interface SupportTicket {
  opened: string;
  id: number;
  closed: string | null;
  closable: boolean;
  description: string;
  entity: Entity | null;
  gravatar_id: string;
  attachments: string[];
  opened_by: string;
  status: 'closed' | 'new' | 'open';
  summary: string;
  updated: string;
  updated_by: string | null;
}

export interface SupportReply {
  created: string;
  created_by: string;
  gravatar_id: string;
  description: string;
  id: number;
  from_linode: boolean;
}

export interface ReplyRequest {
  ticket_id: number;
  description: string;
}

export interface TicketRequest {
  summary: string;
  description: string;
  domain_id?: number;
  linode_id?: number;
  longviewclient_id?: number;
  nodebalancer_id?: number;
  volume_id?: number;
}
