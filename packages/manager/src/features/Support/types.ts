import { SupportReply, SupportTicket } from 'linode-js-sdk/lib/support/types';

export interface ExtendedTicket extends SupportTicket {
  gravatarUrl: string | undefined;
}

export interface ExtendedReply extends SupportReply {
  gravatarUrl: string | undefined;
}
