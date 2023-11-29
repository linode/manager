/**
 * UI helpers for Enhanced Select component.
 */
export const select = {
  /**
   * Finds an Enhanced Select by its text value.
   *
   * @param selectText - Select component inner text.
   *
   * @returns Cypress chainable.
   */
  findByText: (selectText: string) => {
    return cy
      .get(`[data-qa-enhanced-select="${selectText}"]`)
      .findByText(selectText);
  },

  /**
   * Finds a Select menu item by its `data-qa-option` ID.
   *
   * This assumes that the Enhanced Select menu is already open.
   *
   * @param id - ID of menu item to find.
   *
   * @returns Cypress chainable.
   */
  findItemById: (id: string) => {
    return cy
      .get(`[data-qa-option="${id}"]`)
      .scrollIntoView()
      .should('be.visible');
  },

  /**
   * Finds a Select menu item by its text contents.
   *
   * This assumes that the Enhanced Select menu is already open.
   *
   * @param text - Text of menu item to find.
   *
   * @returns Cypress chainable.
   */
  findItemByText: (text: string) => {
    return cy
      .get('[data-qa-option]')
      .contains(text)
      .scrollIntoView()
      .should('be.visible');
  },

  /**
   * Finds a LinodeSelect menu item by its text contents.
   *
   * This assumes that the Enhanced Select menu is already open.
   *
   * @param text - Text of menu item to find.
   *
   * @returns Cypress chainable.
   */
  findLinodeItemByText: (text: string) => {
    return cy
      .get('[data-qa-linode-option]')
      .contains(text)
      .scrollIntoView()
      .should('be.visible');
  },
};
