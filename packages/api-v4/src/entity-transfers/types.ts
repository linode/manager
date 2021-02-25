export type EntityTransferStatus =
  | 'pending'
  | 'accepted'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'stale';

// @todo merge this with the types made for M3-4900
export interface TransferEntities {
  linodes: number[];
}

export interface EntityTransfer {
  token: string;
  status: EntityTransferStatus;
  created: string;
  updated: string;
  is_sender: boolean;
  expiry: string;
  entities: TransferEntities;
}
export interface CreateTransferPayload {
  entities: TransferEntities;
}
