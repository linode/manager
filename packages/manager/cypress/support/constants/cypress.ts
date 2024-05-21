/**
 * @file Constants related to the operation of Cypress end-to-end tests.
 */

/**
 * Tag to identify test entities, resources, etc.
 */
export const entityTag = 'cy-test';

/**
 * Tag to identify resources that tests depend on.
 */
export const dependencyTag = 'cy-dep';

/**
 * Prefix for entity names and labels that will be created by Cypress tests.
 *
 * The prefix contains the entity tag followed by a hyphen.
 *
 * This can be used to identify resources created by Cypress, e.g. for
 * clean-up purposes.
 */
export const entityPrefix = `${entityTag}-`;

/**
 * Prefix for entity names and labels that will be created by Cypress tests.
 *
 * Dependency entities may be relied upon by multiple tests and have different
 * clean up behavior.
 */
export const dependencyPrefix = `${dependencyTag}-`;
