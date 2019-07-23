// import { searchableItems } from 'src/__data__/searchableItems
import * as searchString from 'search-string';
import { searchableItems } from 'src/__data__/searchableItems';
import * as RefinedSearch from './refinedSearch';
import { QueryJSON } from './refinedSearch';
import { SearchableItem } from './search.interfaces';

const {
  areAllTrue,
  areAnyTrue,
  doesSearchTermMatchItemField,
  ensureValueIsString,
  flattenSearchableItem,
  formatQuery,
  getQueryInfo,
  getRealEntityKey,
  isSimpleQuery,
  recursivelyTestItem,
  refinedSearch,
  searchDefaultFields,
  testItem
} = RefinedSearch;

const data = searchableItems as SearchableItem[];

describe('Refined Search', () => {
  describe('simple query', () => {
    it('should search labels', () => {
      const query = 'test-linode-001';
      const results = refinedSearch(query, data).map(entity => entity.label);
      expect(results).toContain('test-linode-001');
    });
    it('should not include non matching label results', () => {
      const query = 'test-linode-001';
      const results = refinedSearch(query, data).map(entity => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });
    it('should search tags', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });
    it('should not include non matching tag results', () => {
      const query = 'production';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([2, 3]);
    });
    it('should search both label and tags', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
    it('should search by partial label', () => {
      const query = 'test-linode-00';
      const results = refinedSearch(query, data).map(entity => entity.label);
      expect(results).toEqual([
        'test-linode-001',
        'test-linode-002',
        'test-linode-003'
      ]);
    });
    it('should search by partial tag', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
  });

  describe('key value search', () => {
    it('should allow searching by label', () => {
      const query = 'label:test-linode-001';
      const results = refinedSearch(query, data).map(entity => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });

    it('should allow searching by single tag', () => {
      const query = 'tags:my-app';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('should allow searching by multiple tags', () => {
      const query = 'tags:my-app2,production';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);
    });

    it('should treat multiple tags as AND condition instead of OR', () => {
      const query = 'tags:my-app,unrelated-app';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);
    });

    it('should allow specifying multiple keys', () => {
      const query = 'label:test-linode tags:my-app2';
      const results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);
    });

    it('should allow negating key values with the "-" character', () => {
      let query = '-label:test-linode';
      let results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([4]);

      query = '-tag:production,unrelated-app';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 4]);
    });

    it('does not crash when unknown keys are specified', () => {
      const query = 'unknown:hello';
      expect(refinedSearch(query, data)).toEqual([]);
    });

    it('makes known substitutions', () => {
      let query = 'tags:my-app';
      let results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
      query = 'name:test-linode-001';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1]);
    });
  });

  describe('boolean logic', () => {
    it('allows joining search terms with AND', () => {
      let query = 'label:test-linode-002 AND tags:my-app2';
      let results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 AND tags:my-app';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('allows joining search terms with OR', () => {
      let query = 'label:test-linode-002 OR tags:my-app2';
      let results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 OR tags:my-app';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([1, 2, 3]);
    });

    it('allows incomplete queries', () => {
      let query = 'label:test-linode AND';
      let results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode AN';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ANDD';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode OR';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ORR';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode O';
      results = refinedSearch(query, data).map(entity => entity.value);
      expect(results).toEqual([]);
    });
  });
});

const mockLinode: SearchableItem = {
  value: 1234,
  label: 'my-linode',
  entityType: 'linode',
  data: {
    tags: ['my-app', 'production'],
    ips: ['1234']
  }
};

describe('formatQuery', () => {
  it('trims whitespace', () => {
    expect(formatQuery('hello world  ')).toBe('hello world');
    expect(formatQuery('  hello world  ')).toBe('hello world');
    expect(formatQuery('  hello world')).toBe('hello world');
    expect(formatQuery('hello world')).toBe('hello world');
  });

  it('replaces " && " with " AND "', () => {
    expect(formatQuery('hello && world')).toBe('hello AND world');
    expect(formatQuery('hello &&world')).toBe('hello &&world');
    expect(formatQuery('hello&&world')).toBe('hello&&world');
    expect(formatQuery('hello AND world')).toBe('hello AND world');
    expect(formatQuery('hello AND world')).toBe('hello AND world');
  });

  it('replaces " || " with " OR "', () => {
    expect(formatQuery('hello || world')).toBe('hello OR world');
    expect(formatQuery('hello ||world')).toBe('hello ||world');
    expect(formatQuery('hello||world')).toBe('hello||world');
    expect(formatQuery('hello OR world')).toBe('hello OR world');
    expect(formatQuery('hello OR world')).toBe('hello OR world');
  });
});

describe('recursivelyTestItem', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const queryJSON1: QueryJSON = {
    type: 'and',
    values: [
      { type: 'string', value: 'tags:my-app' },
      { type: 'string', value: 'tags:production' }
    ]
  };

  const queryJSON2: QueryJSON = {
    type: 'or',
    values: [
      { type: 'string', value: 'tags:my-app' },
      { type: 'string', value: 'tags:production' }
    ]
  };

  const queryJSON3: QueryJSON = { type: 'string', value: 'tags:production' };

  const queryJSON4: QueryJSON = {
    type: 'or',
    values: [
      {
        type: 'string',
        value: 'type:linode'
      },
      {
        type: 'and',
        values: [
          {
            type: 'string',
            value: 'tag:my-app'
          },
          {
            type: 'string',
            value: 'type:domain'
          }
        ]
      }
    ]
  };

  const spy_areAnyTrue = jest.spyOn(RefinedSearch, 'areAnyTrue');
  const spy_areAllTrue = jest.spyOn(RefinedSearch, 'areAllTrue');
  const spy_recursivelyTestItem = jest.spyOn(
    RefinedSearch,
    'recursivelyTestItem'
  );

  it('calls the areAllTrue() function if the type is "and"', () => {
    recursivelyTestItem(queryJSON1, mockLinode);
    expect(spy_areAllTrue).toHaveBeenCalled();
  });

  it('calls the areAnyTrue() function if the type is "or"', () => {
    recursivelyTestItem(queryJSON2, mockLinode);
    expect(spy_areAnyTrue).toHaveBeenCalled();
  });

  it('does not call areAnyTrue() or areAllTrue() if it is a single value', () => {
    recursivelyTestItem(queryJSON3, mockLinode);
    // testItem() WILL call areAllTrue, so we test that it's only been called once.
    expect(spy_areAllTrue).toHaveBeenCalledTimes(1);
    expect(spy_areAnyTrue).not.toHaveBeenCalled();
  });

  it('calls itself recursively', () => {
    recursivelyTestItem(queryJSON4, mockLinode);
    expect(spy_recursivelyTestItem).toHaveBeenCalledTimes(2);
  });

  it('returns false if given bad data', () => {
    expect(recursivelyTestItem({} as QueryJSON, mockLinode)).toBe(false);
  });
});

describe('testItem', () => {
  it('returns TRUE if there is a substring match, and FALSE if there is not', () => {
    expect(testItem(mockLinode, 'my-linode')).toBe(true);
    expect(testItem(mockLinode, 'my-')).toBe(true);
    expect(testItem(mockLinode, 'linode')).toBe(true);
    expect(testItem(mockLinode, 'production')).toBe(true);
    expect(testItem(mockLinode, 'my-app')).toBe(true);
    expect(testItem(mockLinode, 'n')).toBe(true);
    expect(testItem(mockLinode, 'hello')).toBe(false);
  });
});

describe('isSimpleQuery', () => {
  it('returns true if there are no specified search fields', () => {
    let parsedQuery = searchString.parse('-hello world').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(true);

    parsedQuery = searchString.parse('hello world').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(true);

    parsedQuery = searchString.parse('hello -world').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(true);
  });

  it('returns false if there are specified search fields', () => {
    let parsedQuery = searchString.parse('label:hello').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(false);

    parsedQuery = searchString.parse('tags:hello,world').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(false);

    parsedQuery = searchString.parse('-label:hello').getParsedQuery();
    expect(isSimpleQuery(parsedQuery)).toBe(false);
  });
});

describe('searchDefaultFields', () => {
  it('searches each default field', () => {
    // Label
    expect(searchDefaultFields(mockLinode, 'my-linode')).toBe(true);
    // Tags
    expect(searchDefaultFields(mockLinode, 'production')).toBe(true);
    // Ips
    expect(searchDefaultFields(mockLinode, '1234')).toBe(true);
  });
});

describe('doesSearchTermMatchItemField', () => {
  it('matches given field name', () => {
    expect(doesSearchTermMatchItemField('my-app', mockLinode, 'tags')).toBe(
      true
    );
    expect(doesSearchTermMatchItemField('my-app', mockLinode, 'ips')).toBe(
      false
    );
    expect(doesSearchTermMatchItemField('12', mockLinode, 'ips')).toBe(true);
  });
});

describe('flattenSearchableItem', () => {
  it('flattens properties in "data" with the rest of the entity', () => {
    expect(flattenSearchableItem(mockLinode)).toHaveProperty('tags');
    expect(flattenSearchableItem(mockLinode)).toHaveProperty('ips');
    expect(flattenSearchableItem(mockLinode)).not.toHaveProperty('data');
  });
});

describe('ensureValueIsString', () => {
  it('returns original input if it is a string', () => {
    expect(ensureValueIsString('hello')).toBe('hello');
    expect(ensureValueIsString('')).toBe('');
  });

  it('returns joined string if input is an array', () => {
    expect(ensureValueIsString(['hello', 'world'])).toBe('hello world');
    expect(ensureValueIsString([1, 2, 3])).toBe('1 2 3');
    expect(ensureValueIsString(['hello'])).toBe('hello');
  });
});

describe('getQueryInfo', () => {
  it('returns searchTerms, fieldName, and isNegated', () => {
    const parsedQuery = { exclude: {}, tags: ['my-app'] };
    expect(getQueryInfo(parsedQuery)).toHaveProperty('searchTerms');
    expect(getQueryInfo(parsedQuery)).toHaveProperty('fieldName');
    expect(getQueryInfo(parsedQuery)).toHaveProperty('isNegated');
  });

  it('returns isNegated as TRUE when excluded is not empty', () => {
    const parsedQuery = { exclude: { tag: ['my-app'] } };
    expect(getQueryInfo(parsedQuery).isNegated).toBe(true);
  });
  it('returns field name', () => {
    const parsedQuery1 = { exclude: { tags: ['my-app'] } };
    expect(getQueryInfo(parsedQuery1).fieldName).toBe('tags');

    const parsedQuery2 = { exclude: {}, tags: ['my-app'] };
    expect(getQueryInfo(parsedQuery2).fieldName).toBe('tags');
  });
  it('returns other search terms', () => {
    const parsedQuery1 = { exclude: { tags: ['my-app'] } };
    expect(getQueryInfo(parsedQuery1).searchTerms).toEqual(['my-app']);

    const parsedQuery2 = { exclude: {}, tags: ['my-app', 'my-other-app'] };
    expect(getQueryInfo(parsedQuery2).searchTerms).toEqual([
      'my-app',
      'my-other-app'
    ]);
  });
});

describe('getRealEntityKey', () => {
  it('returns "label" if given "name" or "title"', () => {
    expect(getRealEntityKey('name')).toBe('label');
    expect(getRealEntityKey('title')).toBe('label');
  });
  it('returns "tags" if given "tag" or "groups"', () => {
    expect(getRealEntityKey('tag')).toBe('tags');
    expect(getRealEntityKey('group')).toBe('tags');
  });
  it('returns "ips" if given "ip"', () => {
    expect(getRealEntityKey('ip')).toBe('ips');
  });
  it('returns the original string if no substitute key is found', () => {
    expect(getRealEntityKey('hello')).toBe('hello');
    expect(getRealEntityKey('')).toBe('');
  });
});

describe('areAllTrue', () => {
  it('returns true if all values in array are true', () => {
    let values = [true, true, true];
    expect(areAllTrue(values)).toBe(true);
    values = [true, false, true];
    expect(areAllTrue(values)).toBe(false);
  });
});

describe('areAnyTrue', () => {
  it('returns true if at least ONE value in array is true', () => {
    let values = [false, false, false];
    expect(areAnyTrue(values)).toBe(false);
    values = [true, false, false];
    expect(areAnyTrue(values)).toBe(true);
    values = [true, true, true];
    expect(areAnyTrue(values)).toBe(true);
  });
});
