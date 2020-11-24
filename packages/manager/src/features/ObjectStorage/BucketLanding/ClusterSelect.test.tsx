import { objectStorageClusters } from 'src/__data__/objectStorageClusters';
import { regions } from 'src/__data__/regionsData';
import { objectStorageClusterToExtendedRegion } from './ClusterSelect';

describe('objectStorageClusterToExtendedRegion', () => {
  it('transforms a list of OBJ clusters to a list of extended regions', () => {
    const result = objectStorageClusterToExtendedRegion(
      objectStorageClusters,
      regions
    );
    expect(result.length).toBe(objectStorageClusters.length);
    result.forEach(thisExtendedRegion => {
      expect(thisExtendedRegion).toHaveProperty('country');
      expect(thisExtendedRegion).toHaveProperty('display');
    });
  });
});
