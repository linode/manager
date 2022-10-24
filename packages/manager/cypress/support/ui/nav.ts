/**
 * Main sidebar navigation UI element.
 */
export const nav = {
  /**
   * Finds the main sidebar navigation element.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('#main-navigation');
  },

  /**
   * Finds the main sidebar navigation toggle button.
   *
   * @returns Cypress chainable.
   */
  findToggleButton: (): Cypress.Chainable => {
    return cy.findByTestId('open-nav-menu');
  },

  /**
   * Finds a sidebar navigation item by its title.
   *
   * @param title - Title of sidebar navigation item to find.
   *
   * @returns Cypress chainable.
   */
  findItemByTitle: (title: string): Cypress.Chainable => {
    return cy.get('#main-navigation').findByText(title).closest('a');
  },
};
