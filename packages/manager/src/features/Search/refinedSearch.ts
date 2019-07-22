import * as logicQueryParser from 'logic-query-parser';
import { all, any, equals, isEmpty } from 'ramda';
import * as searchString from 'search-string';
import { SearchableItem, SearchField } from './search.interfaces';

const DEFAULT_SEARCH_FIELDS = ['label', 'tags', 'ips'];

// =============================================================================
// REFINED SEARCH
// =============================================================================
// Given a query and an array of items, parse the query and test each item.
//
// Example:
//
// Parsing the query: "label:test-linode AND tags:my-app" returns:
//
// { type: 'and',
//   values:
//    [ { type: 'string', value: 'label:test-linode' },
//      { type: 'string', value: 'tags:my-app' } ] }
//
// We then test this object against each item, returning only the items that pass the test.
export const refinedSearch = (
  query: string,
  itemsToSearch: SearchableItem[]
): SearchableItem[] => {
  // 1. Format the query
  const formattedQuery = formatQuery(query);

  // 2. Parse the query
  //
  // Sometimes logicQueryParser will throw an error (e.g. if a query ends with "AND" or "OR").
  // This situation arises frequently if the user is in the middle of typing a query, so we
  // wrap this in a try/catch.
  try {
    const binaryTree = logicQueryParser.parse(formattedQuery);
    const queryJSON: QueryJSON = logicQueryParser.utils.binaryTreeToQueryJson(
      binaryTree
    );

    // 3. Test the parsed query against each item.
    const results: SearchableItem[] = [];
    itemsToSearch.forEach((item: SearchableItem) => {
      if (recursivelyTestItem(queryJSON, item)) {
        results.push({
          ...item,
          data: { ...item.data, searchText: query } // add the original query to item.data
        });
      }
    });
    return results;
  } catch {
    return [];
  }
};

export const formatQuery = (query: string) => {
  return query
    .trim()
    .replace(' && ', ' AND ')
    .replace(' || ', ' OR ');
};

// QueryJSON can contain either:
//
// 1) A SINGLE value: e.g. resulting from the queries "tag:my-app", or "my-linode"
// 2) MULTIPLE values: e.g. resulting from the queries "tag:my-app type:linode", or "tag:my-app OR tag:another-app"
//
// We need to test each value against the Item, but we need to do so recursively to allow nested queries.
// Example of a nested query: "tag:production OR (type:linode AND tag:my-app)"
export const recursivelyTestItem = (
  queryJSON: QueryJSON,
  item: SearchableItem
): boolean => {
  // Base case: we have a SINGLE value, and it's a string. All we have to do is test the value against the Item.
  // Example query: "type:linode"
  if (queryJSON.value && queryJSON.type === 'string') {
    return testItem(item, queryJSON.value);
  }

  // If we have multiple values, we need to recursively call this function until we get ONE value (the base case).
  // We put all of those values into an array and test them.
  // Example query: "tag:my-app AND label:my-linode"
  else if (
    queryJSON.values &&
    (queryJSON.type === 'and' || queryJSON.type === 'or')
  ) {
    // Build an array of conditions for each value
    const parsedValues = queryJSON.values.map(val =>
      recursivelyTestItem(val, item)
    );

    // If it's an "and" condition, all conditions in the array need to be TRUE
    if (queryJSON.type === 'and') {
      return areAllTrue(parsedValues);
    }

    // If it's an "or" condition, only ONE condition in the array needs to be TRUE
    if (queryJSON.type === 'or') {
      return areAnyTrue(parsedValues);
    }
  }

  // Failsafe -- just return false
  return false;
};

// Tests a single item. Searches specific fields if they are specified in the query (e.g. "tag:production").
// Otherwise, search the default fields.
export const testItem = (item: SearchableItem, query: string) => {
  const parsedQuery = searchString.parse(query).getParsedQuery();

  // If there are no specified search fields, we search the default fields.
  if (isSimpleQuery(parsedQuery)) {
    return searchDefaultFields(item, query);
  }

  const { fieldName, searchTerms, isNegated } = getQueryInfo(parsedQuery);

  const matchedSearchTerms = searchTerms.map(searchTerm => {
    const isMatch = doesSearchTermMatchItemField(searchTerm, item, fieldName);
    return isNegated ? !isMatch : isMatch;
  });

  return areAllTrue(matchedSearchTerms);
};

// Determines whether a query is "simple", i.e., doesn't contain any search fields,
// like "tags:my-tag" or "-label:my-linode".
export const isSimpleQuery = (parsedQuery: any) => {
  const { exclude, ...include } = parsedQuery;
  return isEmpty(exclude) && isEmpty(include);
};

export const searchDefaultFields = (item: SearchableItem, query: string) => {
  for (const field of DEFAULT_SEARCH_FIELDS) {
    if (doesSearchTermMatchItemField(query, item, field)) {
      return true;
    }
  }
  return false;
};

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

// Flattens the "data" prop so we can access all fields on the item root
export const flattenSearchableItem = (item: SearchableItem) => ({
  label: item.label,
  type: item.entityType,
  ...item.data
});

export const ensureValueIsString = (value: string | any[]): string =>
  Array.isArray(value) ? value.join(' ') : value ? value : '';

export const getQueryInfo = (parsedQuery: any) => {
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

// Our entities have several fields we'd like to search: "tags", "label", "ips".
// A user might submit the query "tag:my-app". In this case, we want to trade
// "tag" for "tags", since "tags" is the actual name of the intended property.
export const getRealEntityKey = (key: string): SearchField | string => {
  const TAGS: SearchField = 'tags';
  const LABEL: SearchField = 'label';
  const IPS: SearchField = 'ips';
  const TYPE: SearchField = 'type';

  const substitutions = {
    tag: TAGS,
    group: TAGS,
    name: LABEL,
    title: LABEL,
    ip: IPS,
    is: TYPE
  };

  return substitutions[key] || key;
};

// Returns true if all values in array are true
export const areAllTrue = all(equals(true));

// Returns true if at least ONE value in array is true
export const areAnyTrue = any(equals(true));

// This type is used by 'logic-query-parser
export type ValueType = 'and' | 'or' | 'string';

// This interface is used by 'logic-query-parser
export interface QueryJSON {
  type: ValueType;
  value?: string;
  values?: QueryJSON[];
}
