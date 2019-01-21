import { getAddRemoved } from './store.helpers';

describe('store.helpers', () => {
  describe('getAddRemoved', () => {
    const existingList = [{ id: '1' }, { id: 2 }, { id: 3 }];
    const newList = [{ id: 1 }, { id: '3' }, { id: 4 }];
    const result = getAddRemoved(existingList, newList);

    it('should return a list of new and removed items', () => {
      const added = [{ id: 4 }];
      const removed = [{ id: 2 }];
      expect(result).toEqual([ added, removed ]);
    });
  });
});
