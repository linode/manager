/**
 * Action menu UI element.
 */
export const actionMenu = {
  /**
   * Finds an action menu button by its ARIA label value.
   *
   * These labels typically follow this format:
   * 'Action menu for <Entity Type> <Entity Label>'
   *
   * @returns Cypress chainable.
   */
  findByTitle: (actionMenuTitle: string): Cypress.Chainable => {
    return cy.findByLabelText(actionMenuTitle);
  },
};

/**
 * Action menu item UI element.
 */
export const actionMenuItem = {
  /**
   * Finds an action menu item belonging to an open action menu by its title.
   *
   * This only searches for visible menu items (in other words, the menu must
   * already be open).
   *
   * Be aware that action menus are implemented using React Portals. If this
   * is called within the context of a specific DOM element (e.g. by using
   * cy.get(...).within(() => {})), the action menu item may not be found.
   *
   * @param menuItemTitle - Title of the action menu item to find.
   *
   * @returns Cypress chainable.
   */
  findByTitle: (menuItemTitle: string): Cypress.Chainable => {
    return cy
      .get('[data-qa-action-menu]')
      .should('be.visible')
      .find(`[data-qa-action-menu-item="${menuItemTitle}"]`)
      .should('be.visible');
  },
};
