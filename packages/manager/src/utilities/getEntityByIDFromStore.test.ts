import { linode1 as mockLinode } from 'src/__data__/linodes';
import { queryClientFactory } from 'src/queries/base';
import { ApplicationState, storeFactory } from 'src/store';

const mockState = {
  __resources: {
    linodes: {
      itemsById: { [mockLinode.id]: mockLinode },
      results: 1,
    },
  },
};

import { getEntityByIDFromStore } from './getEntityByIDFromStore';

const store = storeFactory(queryClientFactory());
store.getState = () => mockState as ApplicationState;

describe('getEntityByIDFromStore utility function', () => {
  it('should retrieve an entity that exists in the store', () => {
    expect(getEntityByIDFromStore('linode', mockLinode.id, store)).toEqual(
      mockLinode
    );
  });

  it('should return undefined if the entity does not exist in the store', () => {
    expect(getEntityByIDFromStore('linode', 234567, store)).toBeUndefined();
  });

  it('should return undefined if the type is wrong or undefined', () => {
    const x = undefined;
    expect(
      getEntityByIDFromStore('lindodes' as any, 123456, store)
    ).toBeUndefined();
    expect(getEntityByIDFromStore(x as any, x as any, store)).toBeUndefined();
  });
});
