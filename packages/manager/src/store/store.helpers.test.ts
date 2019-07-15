import {
  addMany,
  createDefaultState,
  getAddRemoved,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany,
  updateInPlace
} from './store.helpers';

describe('store.helpers', () => {
  describe('getAddRemoved', () => {
    const existingList = [{ id: '1' }, { id: 2 }, { id: 3 }];
    const newList = [{ id: 1 }, { id: '3' }, { id: 4 }];
    const result = getAddRemoved(existingList, newList);

    it('should return a list of new and removed items', () => {
      const added = [{ id: 4 }];
      const removed = [{ id: 2 }];
      expect(result).toEqual([added, removed]);
    });
  });

  describe('createDefaultState', () => {
    const result = createDefaultState();
    it('should return the unmodified defaultState', () => {
      expect(result).toEqual({
        loading: true,
        lastUpdated: 0,
        items: [],
        itemsById: {},
        error: undefined
      });
    });
  });

  describe('removeMany', () => {
    const state = createDefaultState({
      items: ['1', '2', '3'],
      itemsById: { 1: { id: 1 }, 2: { id: 2 }, 3: { id: 3 } }
    });
    const result = removeMany(['2', '3'], state);

    it('should remove the object with the provided ID', () => {
      expect(result).toEqual({
        ...state,
        items: ['1'],
        itemsById: { 1: { id: 1 } }
      });
    });
  });

  describe('addMany', () => {
    const state = createDefaultState({
      items: ['1', '2', '3'],
      itemsById: { 1: { id: 1 }, 2: { id: 2 }, 3: { id: 3 } }
    });
    const result = addMany([{ id: 99 }, { id: 66 }], state);

    it('should remove the object with the provided ID', () => {
      expect(result).toEqual({
        ...state,
        items: ['1', '2', '3', '66', '99'],
        itemsById: {
          1: { id: 1 },
          2: { id: 2 },
          3: { id: 3 },
          99: { id: 99 },
          66: { id: 66 }
        }
      });
    });
  });

  describe('onError', () => {
    const state = createDefaultState();
    const result = onError([{ reason: 'Something bad happened.' }], state);

    it('should update state with error and complete loading', () => {
      expect(result).toEqual({
        ...createDefaultState(),
        loading: false,
        error: [{ reason: 'Something bad happened.' }]
      });
    });
  });

  describe('onGetAllSuccess', () => {
    const state = createDefaultState();
    const result = onGetAllSuccess([{ id: 1 }, { id: 2 }], state);

    it('should finish loading', () => {
      expect(result).toHaveProperty('loading', false);
    });

    it('should set items list', () => {
      expect(result).toHaveProperty('items', ['1', '2']);
    });

    it('should set itemsById map', () => {
      expect(result).toHaveProperty('itemsById', {
        1: { id: 1 },
        2: { id: 2 }
      });
    });
  });

  describe('onStart', () => {
    const state = createDefaultState();
    const result = onStart(state);

    it('should set to true', () => {
      expect(result).toHaveProperty('loading', true);
    });
  });

  describe('updateInPlace', () => {
    interface TestEntity {
      id: number;
      status: 'active' | 'resizing';
    }

    const state = createDefaultState({
      items: ['1', '2', '3'],
      itemsById: {
        1: { id: 1, status: 'active' },
        2: { id: 2, status: 'active' },
        3: { id: 3, status: 'active' }
      }
    });

    const updateFn = (existing: TestEntity) => ({
      ...existing,
      status: 'resizing'
    });

    it('should update the item when it exists in state', () => {
      const updated = updateInPlace(1, updateFn, state);
      expect(updated.itemsById[1].status).toBe('resizing');
    });

    it('should not affect unspecified properties', () => {
      const updated = updateInPlace(2, updateFn, state);
      expect(updated.itemsById[2].id).toBe(2);
    });

    it('should return state as-is if the item with the given ID is not found', () => {
      const updated = updateInPlace(4, updateFn, state);
      expect(updated).toEqual(state);
    });
  });
});
