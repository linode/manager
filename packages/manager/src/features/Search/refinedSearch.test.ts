// import { searchableItems } from 'src/__data__/searchableItems
import searchString from 'search-string';

import { searchableItems } from 'src/__data__/searchableItems';

import { COMPRESSED_IPV6_REGEX } from './refinedSearch';
import { QueryJSON } from './refinedSearch';
import * as RefinedSearch from './refinedSearch';
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
  testItem,
} = RefinedSearch;

const data = searchableItems as SearchableItem[];

describe('Refined Search', () => {
  describe('simple query', () => {
    it('should search labels', () => {
      const query = 'test-linode-001';
      const results = refinedSearch(query, data).map((entity) => entity.label);
      expect(results).toContain('test-linode-001');
    });
    it('should not include non matching label results', () => {
      const query = 'test-linode-001';
      const results = refinedSearch(query, data).map((entity) => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });
    it('should search tags', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });
    it('should not include non matching tag results', () => {
      const query = 'production';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([2, 3]);
    });
    it('should search both label and tags', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
    it('should search by partial label', () => {
      const query = 'test-linode-00';
      const results = refinedSearch(query, data).map((entity) => entity.label);
      expect(results).toEqual([
        'test-linode-001',
        'test-linode-002',
        'test-linode-003',
      ]);
    });
    it('should search by partial tag', () => {
      const query = 'my-app';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2, 4]);
    });
  });

  describe('key value search', () => {
    it('should allow searching by label', () => {
      const query = 'label:test-linode-001';
      const results = refinedSearch(query, data).map((entity) => entity.label);
      expect(results).toEqual(['test-linode-001']);
    });

    it('should allow searching by single tag', () => {
      const query = 'tags:my-app';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('should allow searching by multiple tags', () => {
      const query = 'tags:my-app2,production';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([2]);
    });

    it('should treat multiple tags as AND condition instead of OR', () => {
      const query = 'tags:my-app,unrelated-app';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);
    });

    it('should allow specifying multiple keys', () => {
      const query = 'label:test-linode tags:my-app2';
      const results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([2]);
    });

    it('should allow negating key values with the "-" character', () => {
      let query = '-label:test-linode';
      let results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([4]);

      query = '-tag:production,unrelated-app';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 4]);
    });

    it('does not crash when unknown keys are specified', () => {
      const query = 'unknown:hello';
      expect(refinedSearch(query, data)).toEqual([]);
    });

    it('makes known substitutions', () => {
      let query = 'tags:my-app';
      let results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2]);
      query = 'name:test-linode-001';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1]);
    });
  });

  describe('boolean logic', () => {
    it('allows joining search terms with AND', () => {
      let query = 'label:test-linode-002 AND tags:my-app2';
      let results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 AND tags:my-app';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2]);
    });

    it('allows joining search terms with OR', () => {
      let query = 'label:test-linode-002 OR tags:my-app2';
      let results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([2]);

      query = 'label:test-linode-00 OR tags:my-app';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([1, 2, 3]);
    });

    it('allows incomplete queries', () => {
      let query = 'label:test-linode AND';
      let results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode AN';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ANDD';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode OR';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);

      query = 'label:test-linode ORR';
      results = refinedSearch(query, data).map((entity) => entity.value);
      expect(results).toEqual([]);
    });
  });
});

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

const mockLinode: SearchableItem = {
  value: 1234,
  label: 'my-linode',
  entityType: 'linode',
  data: {
    tags: ['my-app', 'production'],
    ips: ['1234'],
  },
};

// Identical to above, but satisfies search queries.
const mockLinodeMatch: SearchableItem = {
  value: 1234,
  label: 'my-2nd-linode',
  entityType: 'linode',
  data: {
    tags: ['production', 'beta', 'lab'],
    ips: ['1234'],
  },
};

describe('recursivelyTestItem', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const basicQuery: QueryJSON = {
    type: 'string',
    value: 'tag:beta',
  };

  const andQuery: QueryJSON = {
    type: 'and',
    values: [
      { type: 'string', value: 'tag:production' },
      { type: 'string', value: 'tag:beta' },
    ],
  };

  const deepQuery: QueryJSON = {
    type: 'or',
    values: [
      { type: 'string', value: 'tag:beta' },
      {
        type: 'and',
        values: [
          { type: 'string', value: 'tag:production' },
          { type: 'string', value: 'tag:lab' },
        ],
      },
    ],
  };

  it('returns true when item matches query', () => {
    expect(recursivelyTestItem(basicQuery, mockLinodeMatch)).toBe(true);
    expect(recursivelyTestItem(andQuery, mockLinodeMatch)).toBe(true);
    expect(recursivelyTestItem(deepQuery, mockLinodeMatch)).toBe(true);
  });

  it('returns false when item does not match query', () => {
    expect(recursivelyTestItem(basicQuery, mockLinode)).toBe(false);
    expect(recursivelyTestItem(andQuery, mockLinode)).toBe(false);
    expect(recursivelyTestItem(deepQuery, mockLinode)).toBe(false);
  });

  it('returns false when given invalid query', () => {
    expect(recursivelyTestItem({} as QueryJSON, mockLinode)).toEqual(false);
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
    let query = '-hello world';
    let parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(true);

    query = '-hello world';
    parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(true);

    query = 'hello -world';
    parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(true);
  });

  it('returns false if there are specified search fields', () => {
    let query = 'label:hello';
    let parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(false);

    query = 'tags:hello,world';
    parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(false);

    query = '-label:hello';
    parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(false);
  });

  it('returns true if we match a shouldSkipFieldSearch rule', () => {
    const query = '2001:db8:3c4d:15::1a2f:1a2b';
    const parsedQuery = searchString.parse(query).getParsedQuery();
    expect(isSimpleQuery(query, parsedQuery)).toBe(true);
  });
});

describe('IPv6 regex', () => {
  it('matches compressed IPv6 addresses', () => {
    expect(
      '2001:db8:3c4d:15::1a2f:1a2b'.match(COMPRESSED_IPV6_REGEX)
    ).toBeTruthy();
    expect('2001:db8::'.match(COMPRESSED_IPV6_REGEX)).toBeTruthy();
    expect('2001:db8::1234:5678'.match(COMPRESSED_IPV6_REGEX)).toBeTruthy();
    expect('::1234:5678'.match(COMPRESSED_IPV6_REGEX)).toBeTruthy();
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
  it('is case-insensitive by default', () => {
    expect(doesSearchTermMatchItemField('MY-APP', mockLinode, 'tags')).toBe(
      true
    );
  });
  it('is case-sensitive if specified', () => {
    expect(
      doesSearchTermMatchItemField('MY-APP', mockLinode, 'tags', true)
    ).toBe(false);
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
      'my-other-app',
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
