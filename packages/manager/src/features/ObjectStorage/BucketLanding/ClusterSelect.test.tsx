import { objectStorageClusterFactory } from 'src/factories';
import { objectStorageClusterToExtendedRegion } from './ClusterSelect';

const regions = require('src/cachedData/regions.json');

describe('objectStorageClusterToExtendedRegion', () => {
  it('transforms a list of OBJ clusters to a list of extended regions', () => {
    const clusters = objectStorageClusterFactory.buildList(2);
    const result = objectStorageClusterToExtendedRegion(clusters, regions.data);
    expect(result.length).toBe(clusters.length);
    result.forEach(thisExtendedRegion => {
      expect(thisExtendedRegion).toHaveProperty('country');
      expect(thisExtendedRegion).toHaveProperty('display');
    });
  });
});
