import { searchableItems } from 'src/__data__/searchableItems';
import { refinedSearch as search, SearchableItem } from './refinedSearch';

const data = searchableItems as SearchableItem[];

describe('Refined Search', () => {
  describe('simple query', () => {
    it('should search labels', () => {
      const query = 'test-linode-001';
      const results = search(query, data).map(entity => entity.label);
      expect(results).toContain('test-linode-001');
    });
    it('should not include non matching label results', () => {
      const query = 'test-linode-001';
      const results = search(query, data).map(entity => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });
    it('should search tags', () => {
      const query = 'my-app';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });
    it('should not include non matching tag results', () => {
      const query = 'production';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([2, 3]);
    });
    it('should search both label and tags', () => {
      const query = 'my-app';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
    it('should search by partial label', () => {
      const query = 'test-linode-00';
      const results = search(query, data).map(entity => entity.label);
      expect(results).toEqual([
        'test-linode-001',
        'test-linode-002',
        'test-linode-003'
      ]);
    });
    it('should search by partial tag', () => {
      const query = 'my-app';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
  });

  describe('key value search', () => {
    it('should allow searching by label', () => {
      const query = 'label:test-linode-001';
      const results = search(query, data).map(entity => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });

    it('should allow searching by single tag', () => {
      const query = 'tags:my-app';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('should allow searching by multiple tags', () => {
      const query = 'tags:my-app2,production';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);
    });

    it('should treat multiple tags as AND condition instead of OR', () => {
      const query = 'tags:my-app,unrelated-app';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);
    });

    it('should allow specifying multiple keys', () => {
      const query = 'label:test-linode tags:my-app2';
      const results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);
    });

    it('should allow negating key values with the "-" character', () => {
      let query = '-label:test-linode';
      let results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([4]);

      query = '-tag:production,unrelated-app';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 4]);
    });

    it('does not crash when unknown keys are specified', () => {
      const query = 'unknown:hello';
      expect(search(query, data)).toEqual([]);
    });

    it('makes known substitutions', () => {
      let query = 'tags:my-app';
      let results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
      query = 'name:test-linode-001';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1]);
    });
  });

  describe('boolean logic', () => {
    it('allows joining search terms with AND', () => {
      let query = 'label:test-linode-002 AND tags:my-app2';
      let results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 AND tags:my-app';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('allows joining search terms with OR', () => {
      let query = 'label:test-linode-002 OR tags:my-app2';
      let results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 OR tags:my-app';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 3]);
    });

    it('allows incomplete queries', () => {
      let query = 'label:test-linode AND';
      let results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode AN';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ANDD';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode OR';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ORR';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode O';
      results = search(query, data).map(entity => entity.value);
      expect(results).toEqual([]);
    });
  });
  it('', () => {
    // const query = 'tags:123123';
    // console.log(search(query, data));
  });
});
