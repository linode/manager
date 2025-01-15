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
   * Finds a sidebar navigation item by its title.
   *
   * @param title - Title of sidebar navigation item to find.
   *
   * @returns Cypress chainable.
   */
  findItemByTitle: (title: string, category?: string): Cypress.Chainable => {
    if (!category) {
      return cy.get('#main-navigation').findByText(title).closest('a');
    }

    // Click the category to expand the navigation menu
    cy.get('#main-navigation')
      .get(`p:contains("${category}")`)
      .closest('[role="button"]')
      .click();

    // Find the item by its title
    return cy.get('#main-navigation').findByTestId(`menu-item-${title}`);
  },

  /**
   * Finds the main sidebar navigation toggle button.
   *
   * @returns Cypress chainable.
   */
  findToggleButton: (): Cypress.Chainable => {
    return cy.findByTestId('open-nav-menu');
  },
};
