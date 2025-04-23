import type { Context } from 'mocha';
import { removeDuplicates } from './arrays';

const queryRegex = /(?:-|\+)?([^\s]+)/g;

/**
 * Allowed test tags.
 */
export type TestTag =
  // Environment-related tags.
  // Used to identify tests where certain environment-specific features are required.
  | 'env:marketplaceApps'
  | 'env:multipleRegions'
  | 'env:premiumPlans'
  | 'env:stackScripts'

  // Feature-related tags.
  // Used to identify tests which deal with a certain feature or features.
  | 'feat:linodes'
  | 'feat:placementGroups'

  // Purpose-related tags.
  // Describes additional uses for which a test may serve.
  // For example, a test which creates a Linode end-to-end could be useful for
  // DC testing purposes even if that is not the primary purpose of the test.
  | 'purpose:dcTesting'
  | 'purpose:smokeTesting'
  | 'purpose:syntheticTesting'

  // Method-related tags.
  // Describe the way the tests operate -- either end-to-end using real API requests,
  // or integration using mocked API requests.
  | 'method:e2e'
  | 'method:mock';

/**
 *
 */
export const testTagMap: Map<string, TestTag[]> = new Map();

/**
 * Extended Mocha context that contains a tags property.
 *
 * `Context` already allows for arbitrary key/value pairs, this type simply
 * enforces the `tags` property as an optional array of strings.
 */
export type ExtendedMochaContext = Context & {
  tags?: string[];
};

/**
 * Sets tags for the current runnable.
 *
 * @param tags - Test tags.
 */
export const tag = (...tags: TestTag[]) => {
  const extendedMochaContext = cy.state('ctx') as ExtendedMochaContext;

  if (extendedMochaContext) {
    extendedMochaContext.tags = removeDuplicates(tags);
  }
};

/**
 * Adds tags for the given runnable.
 *
 * If tags have already been set (e.g. using a hook), this method will add
 * the given tags in addition the tags that have already been set.
 *
 * @param tags - Test tags.
 */
export const addTag = (...tags: TestTag[]) => {
  const extendedMochaContext = cy.state('ctx') as ExtendedMochaContext;

  if (extendedMochaContext) {
    extendedMochaContext.tags = removeDuplicates([
      ...(extendedMochaContext.tags || []),
      ...tags,
    ]);
  }
};

/**
 * Returns a boolean indicating whether `query` is a valid test tag query.
 *
 * @param query - Test tag query string.
 *
 * @return `true` if `query` is valid, `false` otherwise.
 */
export const validateQuery = (query: string) => {
  // An empty string is a special case.
  if (query === '') {
    return true;
  }
  const result = queryRegex.test(query);
  queryRegex.lastIndex = 0;
  return result;
};

/**
 * Gets an array of individual query rules from a query string.
 *
 * @param query - Query string from which to get query rules.
 *
 * @example
 * // Query for all Linode or Volume tests, which also test Placement Groups,
 * // and which are not end-to-end.
 * const query = '+feat:linode,feat:volumes feat:placementGroups -e2e'
 * getQueryRules(query);
 * // Expected output: ['+feat:linode,feat:volumes', '+feat:placementGroups', '-e2e']
 *
 * @returns Array of query rule strings.
 */
export const getQueryRules = (query: string) => {
  return (query.match(queryRegex) ?? []).map((rule: string) => {
    if (!['-', '+'].includes(rule[0]) || rule.length === 1) {
      return `+${rule}`;
    }
    return rule;
  });
};

/**
 * Returns an array of human-readable query rules.
 *
 * This can be useful for presentation or debugging purposes.
 */
export const getHumanReadableQueryRules = (query: string) => {
  return getQueryRules(query).map((queryRule: string) => {
    const queryOperation = queryRule[0];
    const queryOperands = queryRule.slice(1).split(',');

    const operationName =
      queryOperation === '+' ? `HAS TAG` : `DOES NOT HAVE TAG`;
    const tagNames = queryOperands.join(' OR ');

    return `${operationName} ${tagNames}`;
  });
};

/**
 * Evaluates a query rule against an array of test tags.
 *
 * @param queryRule - Query rule against which to evaluate test tags.
 * @param tags - Tags to evaluate.
 *
 * @returns `true` if tags satisfy the query rule, `false` otherwise.
 */
export const evaluateQueryRule = (
  queryRule: string,
  tags: TestTag[]
): boolean => {
  const queryOperation = queryRule[0]; // Either '-' or '+'.
  const queryOperands = queryRule.slice(1).split(','); // The tags to check.

  return queryOperation === '+'
    ? tags.some((tag) => queryOperands.includes(tag))
    : !tags.some((tag) => queryOperands.includes(tag));
};

/**
 * Evaluates a query against an array of test tags.
 *
 * Tags are considered to satisfy query if every query rule evaluates to `true`.
 *
 * @param query - Query against which to evaluate test tags.
 * @param tags - Tags to evaluate.
 *
 * @returns `true` if tags satisfy query, `false` otherwise.
 */
export const evaluateQuery = (query: string, tags: TestTag[]): boolean => {
  if (!validateQuery(query)) {
    throw new Error(`Invalid test tag query '${query}'`);
  }
  return getQueryRules(query).every((queryRule) =>
    evaluateQueryRule(queryRule, tags)
  );
};
