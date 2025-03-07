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
      volume: [],
    });
  });
});
