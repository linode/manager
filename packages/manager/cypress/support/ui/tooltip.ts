/**
 * Tooltip UI helper.
 */
export const tooltip = {
  /**
   * Finds a tooltip that has the given text.
   */
  findByText: (text: string): Cypress.Chainable => {
    return cy.document().its('body').find(`[data-qa-tooltip="${text}"]`);
  },
};
