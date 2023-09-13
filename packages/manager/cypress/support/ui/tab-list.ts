import type { SelectorMatcherOptions } from '@testing-library/cypress';

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
   * @param options - Selector matcher options.
   *
   * @returns Cypress chainable.
   */
  findTabByTitle: (
    tabTitle: string,
    options?: SelectorMatcherOptions
  ): Cypress.Chainable => {
    return cy.get('[data-reach-tab-list]').findByText(tabTitle, options);
  },
};
