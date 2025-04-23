import { generate } from 'peggy';
import type { Filter, FilterConditionTypes } from '@linode/api-v4';
import grammar from './search.peggy?raw';

const parser = generate(grammar);

interface Options {
  /**
   * Defines the API fields filtered against (currently using +contains)
   * when the search query contains no operators.
   *
   * @example ['label', 'tags']
   */
  searchableFieldsWithoutOperator: string[];
  /**
   * Somtimes, we may need to change the way the parser transforms operations
   * into API filters. This option allows you to specify a custom transformation
   * for a specific searchable field.
   */
  filterShapeOverrides?: Partial<Record<keyof FilterConditionTypes, { field: string; filter: (value: string) => Filter }>>;
}

/**
 * Takes a search query and returns a valid X-Filter for Linode API v4
 */
export function getAPIFilterFromQuery(query: string | null | undefined, options: Options) {
  if (!query) {
    return { filter: {}, error: null };
  }

  let filter: Filter = {};
  let error: SyntaxError | null = null;

  try {
    filter = parser.parse(query, options);
  } catch (e) {
    error = e as SyntaxError;
  }

  return { filter, error };
}
