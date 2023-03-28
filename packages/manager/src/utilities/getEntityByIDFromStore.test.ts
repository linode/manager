import { vi } from 'vitest';
import { linode1 as mockLinode } from 'src/__data__/linodes';

const mockState = {
  __resources: {
    linodes: {
      results: 1,
      itemsById: { [mockLinode.id]: mockLinode },
    },
  },
};

import { getEntityByIDFromStore } from './getEntityByIDFromStore';

vi.mock('src/store', async () => {
  return {
    default: {
      getState: () => mockState,
    },
  };
});

describe('getEntityByIDFromStore utility function', () => {
  it('should retrieve an entity that exists in the store', () => {
    expect(getEntityByIDFromStore('linode', mockLinode.id)).toEqual(mockLinode);
  });

  it('should return undefined if the entity does not exist in the store', () => {
    expect(getEntityByIDFromStore('linode', 234567)).toBeUndefined();
  });

  it('should return undefined if the type is wrong or undefined', () => {
    const x = undefined;
    expect(getEntityByIDFromStore('lindodes' as any, 123456)).toBeUndefined();
    expect(getEntityByIDFromStore(x as any, x as any)).toBeUndefined();
  });

  it('should work as a curried function', () => {
    const getLinode = getEntityByIDFromStore('linode');
    expect(getLinode(mockLinode.id)).toEqual(mockLinode);
  });
});
