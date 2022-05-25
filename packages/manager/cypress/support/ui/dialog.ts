/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
export const dialog = {
  /**
   * Finds a drawer.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-dialog="true"]');
  },

  /**
   * Finds a drawer that has the given title.
   */
  findByTitle: (title: string): Cypress.Chainable => {
    return cy
      .get(`[data-qa-dialog-title="${title}"]`)
      .closest('[data-qa-dialog="true"]');
  },
};
