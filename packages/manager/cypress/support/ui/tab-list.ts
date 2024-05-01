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
    return cy.get(`[data-qa-tab="${tabTitle}"]`);
  },

  /**
   * Finds a tab panel within a tab list by its title.
   *
   * @param tabTitle - Title of tab for which to find panel.
   *
   * @returns Cypress chainable.
   */
  findTabPanelByTitle: (tabTitle: string): Cypress.Chainable => {
    return cy.get(`[data-qa-tab-panel="${tabTitle}"]`);
  },
};
