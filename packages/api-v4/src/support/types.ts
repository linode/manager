import type { Entity } from '../account/types';

export interface SupportTicket {
  attachments: string[];
  closable: boolean;
  closed: null | string;
  description: string;
  entity: Entity | null;
  gravatar_id: string;
  id: number;
  opened: string;
  opened_by: string;
  severity: null | TicketSeverity;
  status: 'closed' | 'new' | 'open';
  summary: string;
  updated: string;
  updated_by: null | string;
}

export interface SupportReply {
  created: string;
  created_by: string;
  description: string;
  friendly_name: string;
  from_linode: boolean;
  gravatar_id: string;
  id: number;
}

export interface ReplyRequest {
  description: string;
  ticket_id: number;
}

export interface TicketRequest {
  bucket?: string;
  description: string;
  domain_id?: number;
  linode_id?: number;
  longviewclient_id?: number;
  nodebalancer_id?: number;
  region?: string;
  severity?: TicketSeverity;
  summary: string;
  volume_id?: number;
}

export type TicketSeverity = 1 | 2 | 3;
