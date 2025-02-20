import * as commonLocators from 'support/ui/locators/common-locators';

/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
export const mainSearch = {
  /**
   * Finds a drawer.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get(commonLocators.topMenuItemsLocator.searchInput);
  },
};
