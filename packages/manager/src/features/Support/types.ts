import { SupportReply, SupportTicket } from '@linode/api-v4';

export interface ExtendedTicket extends SupportTicket {
  gravatarUrl: string | undefined;
}

export interface ExtendedReply extends SupportReply {
  gravatarUrl: string | undefined;
}
