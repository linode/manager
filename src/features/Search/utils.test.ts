import { searchableItems } from 'src/__data__/searchableItems';
import { SearchableItem } from 'src/features/Search/search.interfaces';
import { separateResultsByEntity } from './utils';

const data = searchableItems as SearchableItem[];

describe('separate results by entity', () => {
  const results = separateResultsByEntity(data);
  it('contains keys of each entity type', () => {
    expect(results).toHaveProperty('linodes');
    expect(results).toHaveProperty('volumes');
    expect(results).toHaveProperty('domains');
    expect(results).toHaveProperty('images');
    expect(results).toHaveProperty('nodebalancers');
  });

  it('the value of each entity type is an array', () => {
    expect(results.linodes).toBeInstanceOf(Array);
    expect(results.volumes).toBeInstanceOf(Array);
    expect(results.domains).toBeInstanceOf(Array);
    expect(results.images).toBeInstanceOf(Array);
    expect(results.nodebalancers).toBeInstanceOf(Array);
  });

  it('returns empty results if there is no data', () => {
    const newResults = separateResultsByEntity([]);
    expect(newResults).toEqual({
      linodes: [],
      volumes: [],
      domains: [],
      images: [],
      nodebalancers: []
    });
  });
});
