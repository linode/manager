import { generate } from 'peggy';
import type { Filter } from '@linode/api-v4';
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