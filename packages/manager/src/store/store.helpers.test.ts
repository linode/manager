import {
  addMany,
  createDefaultState,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany,
} from './store.helpers';

describe('store.helpers', () => {
  describe('createDefaultState', () => {
    const result = createDefaultState();
    it('should return the unmodified defaultState', () => {
      expect(result).toEqual({
        error: undefined,
        items: [],
        itemsById: {},
        lastUpdated: 0,
        loading: false,
      });
    });
  });

  describe('removeMany', () => {
    const state = createDefaultState({
      items: ['1', '2', '3'],
      itemsById: { 1: { id: 1 }, 2: { id: 2 }, 3: { id: 3 } },
    });
    const result = removeMany(['2', '3'], state);

    it('should remove the object with the provided ID', () => {
      expect(result).toEqual({
        ...state,
        items: ['1'],
        itemsById: { 1: { id: 1 } },
      });
    });
  });

  describe('addMany', () => {
    const state = createDefaultState({
      items: ['1', '2', '3'],
      itemsById: { 1: { id: 1 }, 2: { id: 2 }, 3: { id: 3 } },
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
          66: { id: 66 },
          99: { id: 99 },
        },
      });
    });
  });

  describe('onError', () => {
    const state = createDefaultState();
    const result = onError([{ reason: 'Something bad happened.' }], state);

    it('should update state with error and complete loading', () => {
      expect(result).toEqual({
        ...createDefaultState(),
        error: [{ reason: 'Something bad happened.' }],
        loading: false,
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
        2: { id: 2 },
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
});
