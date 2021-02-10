export type TransferableEntity = 'linodes';
export const TRANSFERABLE_ENTITIES: TransferableEntity[] = ['linodes'];

export type TransferEntity = Record<string, string>;
export type TransferState = Record<TransferableEntity, TransferEntity[]>;

export const defaultTransferState: TransferState = TRANSFERABLE_ENTITIES.reduce(
  (acc, thisEntity) => ({ ...acc, [thisEntity]: [] }),
  {} as TransferState
);
