/**
 * @file Constants related to the operation of Cypress end-to-end tests.
 */

/**
 * Tag to identify test entities, resources, etc.
 */
export const entityTag = 'cy-test';

/**
 * Prefix for entity names and labels that will be created by Cypress tests.
 *
 * The prefix contains the entity tag followed by a hyphen.
 *
 * This can be used to identify resources created by Cypress, e.g. for
 * clean-up purposes.
 */
export const entityPrefix = `${entityTag}-`;
