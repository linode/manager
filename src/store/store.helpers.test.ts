import { createDefaultState, updateInPlace } from './store.helpers';

describe('updateInPlace', () => {
  interface TestEntity { id: number, status: 'active' | 'resizing' };

  const state = createDefaultState({
    items: ['1', '2', '3'],
    itemsById: { 1: { id: 1, status: 'active' }, 2: { id: 2, status: 'active' }, 3: { id: 3, status: 'active' } },
  });

  const updateFn = (existing: TestEntity) => ({ ...existing, status: 'resizing'});

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