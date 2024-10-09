import { searchableItems } from 'src/__data__/searchableItems';

import { separateResultsByEntity } from './utils';

import type { SearchableItem } from 'src/features/Search/search.interfaces';

const data = searchableItems as SearchableItem[];

describe('separate results by entity', () => {
  const results = separateResultsByEntity(data);
  it('contains keys of each entity type', () => {
    expect(results).toHaveProperty('linodes');
    expect(results).toHaveProperty('volumes');
    expect(results).toHaveProperty('domains');
    expect(results).toHaveProperty('images');
    expect(results).toHaveProperty('nodebalancers');
    expect(results).toHaveProperty('kubernetesClusters');
    expect(results).toHaveProperty('buckets');
    expect(results).toHaveProperty('firewalls');
    expect(results).toHaveProperty('databases');
  });

  it('the value of each entity type is an array', () => {
    expect(results.linodes).toBeInstanceOf(Array);
    expect(results.volumes).toBeInstanceOf(Array);
    expect(results.domains).toBeInstanceOf(Array);
    expect(results.images).toBeInstanceOf(Array);
    expect(results.nodebalancers).toBeInstanceOf(Array);
    expect(results.kubernetesClusters).toBeInstanceOf(Array);
    expect(results.buckets).toBeInstanceOf(Array);
    expect(results.firewalls).toBeInstanceOf(Array);
    expect(results.databases).toBeInstanceOf(Array);
  });

  it('returns empty results if there is no data', () => {
    const newResults = separateResultsByEntity([]);
    expect(newResults).toEqual({
      buckets: [],
      databases: [],
      domains: [],
      firewalls: [],
      images: [],
      kubernetesClusters: [],
      linodes: [],
      nodebalancers: [],
      volumes: [],
    });
  });
});
