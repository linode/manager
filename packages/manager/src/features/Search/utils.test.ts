import { searchableItems } from 'src/__data__/searchableItems';

import { separateResultsByEntity } from './utils';

import type { SearchableItem } from 'src/features/Search/search.interfaces';

const data = searchableItems as SearchableItem[];

describe('separate results by entity', () => {
  const results = separateResultsByEntity(data);
  it('contains keys of each entity type', () => {
    expect(results).toHaveProperty('linode');
    expect(results).toHaveProperty('volume');
    expect(results).toHaveProperty('domain');
    expect(results).toHaveProperty('image');
    expect(results).toHaveProperty('nodebalancer');
    expect(results).toHaveProperty('kubernetesCluster');
    expect(results).toHaveProperty('bucket');
    expect(results).toHaveProperty('firewall');
    expect(results).toHaveProperty('database');
  });

  it('the value of each entity type is an array', () => {
    expect(results.linode).toBeInstanceOf(Array);
    expect(results.volume).toBeInstanceOf(Array);
    expect(results.domain).toBeInstanceOf(Array);
    expect(results.image).toBeInstanceOf(Array);
    expect(results.nodebalancer).toBeInstanceOf(Array);
    expect(results.kubernetesCluster).toBeInstanceOf(Array);
    expect(results.bucket).toBeInstanceOf(Array);
    expect(results.firewall).toBeInstanceOf(Array);
    expect(results.database).toBeInstanceOf(Array);
  });

  it('returns empty results if there is no data', () => {
    const newResults = separateResultsByEntity([]);
    expect(newResults).toEqual({
      bucket: [],
      database: [],
      domain: [],
      firewall: [],
      image: [],
      kubernetesCluster: [],
      linode: [],
      nodebalancer: [],
      stackscript: [],
      volume: [],
    });
  });
});
