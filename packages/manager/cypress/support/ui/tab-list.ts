/**
 * Tab list UI element.
 */
export const tabList = {
  /**
   * Finds a tab list.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-reach-tab-list]');
  },

  /**
   * Finds a tab within a tab list by its title.
   *
   * @param tabTitle - Title of tab to find.
   *
   * @returns Cypress chainable.
   */
  findTabByTitle: (tabTitle: string): Cypress.Chainable => {
    return cy.get('[data-reach-tab-list]').findByText(tabTitle);
  },
};
