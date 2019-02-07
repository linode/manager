import * as logicQueryParser from 'logic-query-parser';
import { all, any, isEmpty, keys as ramdaKeys } from 'ramda';
import * as searchString from 'search-string';
import { SearchableItem } from './search.interfaces';

// This type and interface are used by 'logic-query-parser
export type ValueType = 'and' | 'or' | 'string';
export interface Value {
  type: ValueType;
  value?: string;
  values?: Value[];
}

// MAIN SEARCH FUNCTION
export const refinedSearch = (
  query: string,
  items: SearchableItem[]
): SearchableItem[] => {
  const formattedQuery = formatQuery(query);

  // Sometimes logicQueryParser will throw an error (e.g. if a query ends with "AND" or "OR").
  // This situation arises frequently if the user is in the middle of typing a query, so we
  // wrap this in a try/catch.
  try {
    // Parse the query with a 3rd-party library. This turns it into a tree-like object.
    const binaryTree = logicQueryParser.parse(formattedQuery);
    const queryJson = logicQueryParser.utils.binaryTreeToQueryJson(binaryTree);

    // Now we filter items by applying a "test condition" function to each item.
    // The "test condition" function is Ramda/FP style, and will look something like this:
    //
    // or([
    //   and([contains('production', entity.tags), contains('my-app-2', entity.tags)]),
    //   linode.label.includes('test-linode-001'),
    // ]);
    //
    return items.filter((item: SearchableItem) =>
      recursivelyCreateTestConditions(queryJson, item)
    );
  } catch {
    return [];
  }
};

const recursivelyCreateTestConditions = (
  v: Value,
  item: SearchableItem
): boolean => {
  // Base case: we have a SINGLE value, and it's a string. Simple queries like "my-app" fall into this category
  if (v.value && v.type === 'string') {
    return createCondition(v.value, item);
  }

  // If we have multiple values, we need to recursively call this function until we get a single value.
  // Boolean queries like "my-app AND tag:my-tag" fall into this category.
  else if (v.values && (v.type === 'and' || v.type === 'or')) {
    // Build an array of conditions for each value
    const parsedValues = v.values.map(val =>
      recursivelyCreateTestConditions(val, item)
    );

    // If it's an "and" condition, all conditions in the array need to be TRUE
    if (v.type === 'and') {
      return and(parsedValues);
    }

    // If it's an "or" condition, only ONE condition in the array needs to be TRUE
    if (v.type === 'or') {
      return or(parsedValues);
    }
  }

  return false;
};

// Takes a portion of a query ("tag:production") and an entity, and returns
// TRUE if the query matches the entity. The query can match the entity by key type
// (e.g. "tag:production,my-app" will look for entities with a tag called "production" AND a
// tag called "my-app"). If there is no key specified, we'll search label, tags, and ipv4.
const createCondition = (
  queryPortion: string,
  item: SearchableItem
): boolean => {
  // Parse query with 3rd party library
  const parsedValue = searchString.parse(queryPortion).getParsedQuery();

  // If the condition is negated, it will end up in a property called "exclude",
  // so we separate them here.
  const { exclude, ...withoutExclude } = parsedValue;

  // If the condition is negated
  if (!isEmpty(exclude)) {
    const keys: string[] = ramdaKeys<string>(exclude);

    // We should really only have ONE key, so we'll assume this and use the 0th key
    const key = keys[0] || '';

    // "parsedValues" will be an array of all values,
    // e.g. "tag:production,my-app" --> ['production', 'my-app']
    const parsedValues: string[] = exclude[key];

    const substitutedKey = makeSubstitution(key);

    const conditions = parsedValues.map(
      v => !searchEntityField(item, substitutedKey, v)
    );
    return and(conditions);
  } else {
    const valueKeys = ramdaKeys<string>(withoutExclude);

    if (valueKeys.length > 0) {
      const key = valueKeys[0];
      const val = withoutExclude[key];

      const substitutedKey = makeSubstitution(key);

      const conditions: boolean[] = val.map((v: string) =>
        searchEntityField(item, substitutedKey, v)
      );
      return and(conditions);

      // In this case, no keys were specified: the query was simple (e.g. "my-app")
      // So we'll search all fields we're interested in.
    } else {
      const defaultFields = ['label', 'tags', 'ips'];

      const conditions: boolean[] = defaultFields.map(field =>
        searchEntityField(item, field, queryPortion)
      );
      return or(conditions);
    }
  }
};

// =============================================================================
// Utilities
// =============================================================================
const toBoolean = (value: any) => Boolean(value);
export const and = all(toBoolean);
export const or = any(toBoolean);

const searchEntityField = (
  item: SearchableItem,
  field: string,
  queryPortion: string
): boolean => {
  // Items separate label and data, so we need to flatten it
  const entity = { label: item.label, type: item.entityType, ...item.data };

  // If we're searching an array (i.e. tags), convert to a string first
  const toSearch = Array.isArray(entity[field])
    ? entity[field].join(' ')
    : entity[field] || '';

  return toSearch.includes(queryPortion);
};

// A user might search "tag:my-tag". Since our field name on an entity is called "tags",
// we need to make a substitution.
const makeSubstitution = (key: string) => {
  const keySubstitutions = [
    {
      name: 'tags',
      alternatives: ['tag', 'group']
    },
    {
      name: 'label',
      alternatives: ['name', 'title']
    },
    {
      name: 'ips',
      alternatives: ['ip']
    }
  ];

  for (const sub of keySubstitutions) {
    if (sub.alternatives.includes(key)) {
      return sub.name;
    }
  }
  return key;
};

const formatQuery = (query: string) => {
  return query
    .trim()
    .replace('&&', 'AND')
    .replace('||', 'OR');
};
