/**
 * Landing page empty state resources UI element.
 *
 * Useful for checking the content of an empty state landing page. (e.g. /domains with no domains)
 */
export const landingPageEmptyStateResources = {
  /**
   * Finds the entity header and returns the Cypress chainable.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-placeholder-container="resources-section"]');
  },
};
