/* tslint:disable-next-line */
const logicQueryParser = require('logic-query-parser');
/* tslint:disable-next-line */
const searchString = require('search-string');
import { all, any, isEmpty, keys as getKeys } from 'ramda';

export type ValueType = 'and' | 'or' | 'string';

export interface Value {
  type: ValueType;
  value?: string;
  values?: Value[];
}

export interface Linode {
  label: string;
  tags: string[];
  id: number;
}

const toBoolean = (value: any) => Boolean(value);
export const and = all(toBoolean);
export const or = any(toBoolean);

const searchEntityField = (
  entity: any,
  field: string,
  queryPortion: string
) => {
  // If we're searching an array (i.e. tags), convert to a string first
  const toSearch = Array.isArray(entity[field])
    ? entity[field].join(' ')
    : entity[field];

  return toSearch.includes(queryPortion);
};

// SEARCH FUNCTION
export const search = (query: string, data: Linode[]): Linode[] => {
  const cleanedQuery = query.trim();

  // Parse the query with 3rd-party library
  const binaryTree = logicQueryParser.parse(cleanedQuery);
  const queryJson = logicQueryParser.utils.binaryTreeToQueryJson(binaryTree);

  // Now we filter data by applying a "test condition" function to each entity
  // The "test condition" function is Ramda/FP style, and looks something like this:
  //
  // or([
  //   and([contains('production', linode.tags), contains('my-app-2', linode.tags)]),
  //   linode.label.includes('test-linode-001'),
  // ]);
  //
  return data.filter((linode: Linode) =>
    recursivelyCreateTestConditions(queryJson, linode)
  );
};

const recursivelyCreateTestConditions = (v: Value, entity: any): boolean => {
  // Base case: we have a SINGLE value, and it's a string
  if (v.value && v.type === 'string') {
    return createCondition(v.value, entity);
  }

  // If we have multiple values, we need to recursively call this function until we get a single value
  else if (v.values && (v.type === 'and' || v.type === 'or')) {
    // Build an array of conditions for each value
    const parsedValues = v.values.map(val =>
      recursivelyCreateTestConditions(val, entity)
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
// (e.g. "tag:production,my-app" looks for entities with a tag called "production" AND a
// tag called "my-app"). If there is no key specified, we'll search label AND tags.
const createCondition = (queryPortion: string, entity: any): boolean => {
  // Parse query with 3rd party library
  const parsedValue = searchString.parse(queryPortion).getParsedQuery();

  // If the condition is negated, it will end up in a property called "exclude",
  // so we separate them here.
  const { exclude, ...withoutExclude } = parsedValue;
  // If the condition is negated
  if (!isEmpty(parsedValue.exclude)) {
    const keys: string[] = getKeys<string>(exclude);

    if (keys.length > 0) {
      // FULL TEXT MATCH
    }

    // We should really only have ONE key, so we'll assume this and use the 0th key
    const key = keys[0];

    // "parsedValues" will be an array of all values,
    // e.g. "tag:production,my-app" --> ['production', 'my-app']
    const parsedValues: string[] = exclude[key];
    const conditions = parsedValues.map(
      v => !searchEntityField(entity, key, v)
    );
    return and(conditions);
  } else {
    const valueKeys = getKeys<string>(withoutExclude);

    if (valueKeys.length > 0) {
      const key = valueKeys[0];
      const val = withoutExclude[key];
      const conditions: boolean[] = val.map((v: string) =>
        searchEntityField(entity, key, v)
      );
      return and(conditions);

      // Literal string match
    } else {
      const conditions: boolean[] = ['label', 'tags'].map(field =>
        searchEntityField(entity, field, queryPortion)
      );
      return or(conditions);
    }
  }
};
