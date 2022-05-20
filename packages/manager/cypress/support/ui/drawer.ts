/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
export const drawer = {
  /**
   * Finds a drawer.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-drawer="true"]');
  },

  /**
   * Finds a drawer that has the given title.
   */
  findByTitle: (title: string): Cypress.Chainable => {
    return cy
      .get(`[data-qa-drawer-title="${title}"]`)
      .closest('[data-qa-drawer="true"]');
  },
};

/**
 * Drawer close button UI element.
 */
export const drawerCloseButton = {
  /**
   * Finds a drawer close button.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-close-drawer="true"]');
  },
};
