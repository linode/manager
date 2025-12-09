import produce from 'immer';
export type TransferableEntity = 'linodes';
export const TRANSFERABLE_ENTITIES: TransferableEntity[] = ['linodes'];

export type Entity = { id: number | string; label: string };
export type TransferEntity = Record<string, string>;
export type TransferState = Record<TransferableEntity, TransferEntity>;

export const defaultTransferState: TransferState = TRANSFERABLE_ENTITIES.reduce(
  (acc, thisEntity) => ({ ...acc, [thisEntity]: {} }),
  {} as TransferState
);

export type TransferAction =
  | { entitiesToAdd: Entity[]; entityType: TransferableEntity; type: 'ADD' }
  | {
      entitiesToRemove: string[];
      entityType: TransferableEntity;
      type: 'REMOVE';
    }
  | { entity: Entity; entityType: TransferableEntity; type: 'TOGGLE' }
  | { entityType: TransferableEntity; type: 'RESET' };

export const transferReducer = produce(
  (draft: TransferState, action: TransferAction) => {
    switch (action.type) {
      // Add entities to the transfer
      case 'ADD':
        const newEntities = action.entitiesToAdd;
        newEntities.forEach((thisEntity) => {
          draft[action.entityType][thisEntity.id] = thisEntity.label;
        });
        break;

      // Remove entities
      case 'REMOVE':
        action.entitiesToRemove.forEach((thisEntity) => {
          delete draft[action.entityType][thisEntity];
        });
        break;

      // Reset the state
      case 'RESET':
        draft[action.entityType] = {};
        break;

      case 'TOGGLE':
        const entity = action.entity;
        const type = draft[action.entityType];
        if (type[entity.id]) {
          delete type[entity.id];
        } else {
          type[entity.id] = entity.label;
        }
        break;
    }
  }
);
