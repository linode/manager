/**
 * API OAuth token for authenticating API requests and Cloud Manager interactions.
 */
export const oauthToken = Cypress.env('MANAGER_OAUTH');

/**
 * API request pagination page size.
 */
export const pageSize = 500;
