/**
 * Pagination UI helpers.
 */
export const pagination = {
  /**
   * Finds the pagination section within a table.
   *
   * @returns Cypress chainable.
   */
  find: () => {
    return cy.get('[data-qa-table-pagination]');
  },

  /**
   * Finds the pagination page size selection.
   *
   * @returns Cypress chainable.
   */
  findPageSizeSelect: () => {
    return pagination
      .find()
      .get('[data-qa-pagination-page-size]')
      .get('[data-qa-enhanced-select]');
  },

  /**
   * Finds the pagination page selection controls.
   *
   * @returns Cypress chainable.
   */
  findControls: () => {
    return pagination.find().get('[data-qa-pagination-controls]');
  },
};
