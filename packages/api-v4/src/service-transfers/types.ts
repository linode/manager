export type EntityTransferStatus =
  | 'accepted'
  | 'canceled'
  | 'completed'
  | 'failed'
  | 'pending'
  | 'stale';

// @todo merge this with the types made for M3-4900
export interface TransferEntities {
  linodes: number[];
}

export interface EntityTransfer {
  created: string;
  entities: TransferEntities;
  expiry: string;
  is_sender: boolean;
  status: EntityTransferStatus;
  token: string;
  updated: string;
}
export interface CreateTransferPayload {
  entities: TransferEntities;
}
