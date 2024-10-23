import { Entity } from '../account/types';

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
  severity: TicketSeverity | null;
}

export interface SupportReply {
  created: string;
  created_by: string;
  gravatar_id: string;
  description: string;
  id: number;
  from_linode: boolean;
  friendly_name: string;
}

export interface ReplyRequest {
  ticket_id: number;
  description: string;
}

export interface TicketRequest {
  summary: string;
  description: string;
  bucket?: string;
  domain_id?: number;
  linode_id?: number;
  longviewclient_id?: number;
  nodebalancer_id?: number;
  region?: string;
  volume_id?: number;
  severity?: TicketSeverity;
}

export type TicketSeverity = 1 | 2 | 3;
