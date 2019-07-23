import { linode1 as mockLinode } from 'src/__data__/linodes';
import { volumes as mockVolumes } from 'src/__data__/volumes';

const volume = mockVolumes[0];

const mockState = {
  __resources: {
    linodes: {
      results: [mockLinode.id],
      entities: [mockLinode]
    },
    volumes: {
      items: [volume.id],
      itemsById: {
        [volume.id]: volume
      }
    }
  }
};

import { getEntityByIDFromStore } from './getEntityByIDFromStore';

jest.mock('src/store', () => ({
  default: {
    getState: () => mockState
  }
}));

describe('getEntityByIDFromStore utility function', () => {
  it('should retrieve an entity that exists in the store', () => {
    expect(getEntityByIDFromStore('linode', mockLinode.id)).toEqual(mockLinode);
  });

  it('should return undefined if the entity does not exist in the store', () => {
    expect(getEntityByIDFromStore('linode', 234567)).toBeUndefined();
    expect(getEntityByIDFromStore('volume', 23456)).toBeUndefined();
  });

  it('should return undefined if the type is wrong or undefined', () => {
    const x = undefined;
    expect(getEntityByIDFromStore('lindodes' as any, 123456)).toBeUndefined();
    expect(getEntityByIDFromStore(x as any, x as any)).toBeUndefined();
  });

  it('should work as a curried function', () => {
    const getVolume = getEntityByIDFromStore('volume');
    expect(getVolume(volume.id)).toEqual(volume);
  });
});
