/**
 * @file Index file for Cypress page utility re-exports.
 *
 * Page utilities are basic JavaScript objects containing functions to perform
 * common page-specific interactions. They allow us to minimize code duplication
 * across tests that interact with similar pages.
 *
 * Page utilities are NOT page objects in the traditional UI testing sense.
 * Specifically, page utility objects should NOT have state, and page utilities
 * should only be concerned with interacting with or asserting the state of
 * the DOM.
 */

export * from './linode-create-page';
export * from './vpc-create-drawer';
