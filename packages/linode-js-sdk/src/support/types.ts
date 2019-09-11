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
