import * as logicQueryParser from 'logic-query-parser';
import { all, any, equals, isEmpty } from 'ramda';
import * as searchString from 'search-string';
import { SearchableItem, SearchField } from './search.interfaces';

// This type and interface are used by 'logic-query-parser
export type ValueType = 'and' | 'or' | 'string';
export interface Value {
  type: ValueType;
  value?: string;
  values?: Value[];
}

const defaultSearchFields = ['label', 'tags', 'ips'];

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
    return testItem(item, v.value);
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
      return areAllTrue(parsedValues);
    }

    // If it's an "or" condition, only ONE condition in the array needs to be TRUE
    if (v.type === 'or') {
      return areAnyTrue(parsedValues);
    }
  }

  return false;
};

export const testItem = (item: SearchableItem, query: string) => {
  const parsedQuery = searchString.parse(query).getParsedQuery();

  // If there are no specified search fields, we search the default fields.
  if (isSimpleQuery(parsedQuery)) {
    return searchDefaultFields(item, query);
  }

  const { fieldName, searchTerms, isNegated } = provideQueryInfo(parsedQuery);

  for (const searchTerm of searchTerms) {
    const isMatch = doesSearchTermMatchItemField(searchTerm, item, fieldName);

    // @todo: clean up these returns

    // If the search term is negated, we can return FALSE as soon as we find a match
    if (isNegated && isMatch) {
      return false;
      // Otherwise, we can return TRUE as soon as we find a match
    } else if (!isNegated && isMatch) {
      return true;
    }
    return isNegated ? true : false;
  }
  return true;
};

// =============================================================================
// Utilities
// =============================================================================

// Returns true if all values in array are true
export const areAllTrue = all(equals(true));

// Returns true if at least ONE value in array is true
export const areAnyTrue = any(equals(true));

// Returns TRUE if there is a substring match on the specified field
// on the given item
export const doesSearchTermMatchItemField = (
  query: string,
  item: SearchableItem,
  field: string
): boolean => {
  const flattenedItem = flattenSearchableItem(item);

  const fieldValue = ensureValueIsString(flattenedItem[field]);

  return fieldValue.includes(query);
};

// Our entities have several fields we'd like to search: "tags", "label", "ips".
// A user might submit the query "tag:my-app". In this case, we want to trade
// "tag" for "tags", since "tags" is the actual name of the intended property.
export const getRealEntityKey = (key: string): SearchField | string => {
  const TAGS: SearchField = 'tags';
  const LABEL: SearchField = 'label';
  const IPS: SearchField = 'ips';

  const substitutions = {
    tag: TAGS,
    group: TAGS,
    name: LABEL,
    title: LABEL,
    ip: IPS
  };

  return substitutions[key] || key;
};

export const formatQuery = (query: string) => {
  return query
    .trim()
    .replace(' && ', ' AND ')
    .replace(' || ', ' OR ');
};

// Flattens the "data" prop so we can access all fields on the item root
export const flattenSearchableItem = (item: SearchableItem) => ({
  label: item.label,
  type: item.entityType,
  ...item.data
});

export const ensureValueIsString = (value: string | any[]): string =>
  Array.isArray(value) ? value.join(' ') : value ? value : '';

// Determines whether a query is "simple", i.e., doesn't contain any search fields,
// like "tags:my-tag" or "-label:my-linode".
export const isSimpleQuery = (parsedQuery: any) => {
  const { exclude, ...nonExcluded } = parsedQuery;
  return isEmpty(exclude) && isEmpty(nonExcluded);
};

export const searchDefaultFields = (item: SearchableItem, query: string) => {
  for (const field of defaultSearchFields) {
    if (doesSearchTermMatchItemField(query, item, field)) {
      return true;
    }
  }
  return false;
};

export const provideQueryInfo = (parsedQuery: any) => {
  // getParsedQuery() always includes an object called `excluded`. If search
  // terms are negated (e.g. "-tag:my-app"), they go in this object.
  const { exclude: excludedFields, ...includedFields } = parsedQuery;

  const isNegated = !isEmpty(excludedFields);

  const fields = isNegated ? excludedFields : includedFields;
  const searchField = Object.keys(fields)[0];
  const fieldName = getRealEntityKey(searchField);

  const searchTerms: string[] = fields[searchField] || [];

  return {
    searchTerms,
    fieldName,
    isNegated
  };
};
