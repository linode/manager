/**
 * Entity header UI element.
 *
 * Useful for selecting buttons within the entity header, validating entity
 * page heading content, etc.
 */
export const entityHeader = {
  /**
   * Finds the entity header and returns the Cypress chainable.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-entity-header="true"]');
  },
};
