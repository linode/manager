import produce from 'immer';
export type TransferableEntity = 'linodes';
export const TRANSFERABLE_ENTITIES: TransferableEntity[] = ['linodes'];

export type Entity = { label: string; id: string | number };
export type TransferEntity = Record<string, string>;
export type TransferState = Record<TransferableEntity, TransferEntity>;

export const defaultTransferState: TransferState = TRANSFERABLE_ENTITIES.reduce(
  (acc, thisEntity) => ({ ...acc, [thisEntity]: {} }),
  {} as TransferState
);

export type TransferAction =
  | { type: 'ADD'; entityType: TransferableEntity; entitiesToAdd: Entity[] }
  | {
      type: 'REMOVE';
      entityType: TransferableEntity;
      entitiesToRemove: string[];
    }
  | { type: 'TOGGLE'; entityType: TransferableEntity; entity: Entity }
  | { type: 'RESET'; entityType: TransferableEntity };

const transferReducer = (draft: TransferState, action: TransferAction) => {
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

    case 'TOGGLE':
      const entity = action.entity;
      const type = draft[action.entityType];
      if (type[entity.id]) {
        delete type[entity.id];
      } else {
        type[entity.id] = entity.label;
      }
      break;

    // Reset the state
    case 'RESET':
      draft[action.entityType] = {};
      break;
  }
};

export const curriedTransferReducer = produce(transferReducer);
