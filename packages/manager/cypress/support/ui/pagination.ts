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
   * Finds the pagination page selection controls.
   *
   * @returns Cypress chainable.
   */
  findControls: () => {
    return pagination.find().find('[data-qa-pagination-controls]');
  },

  /**
   * Finds the pagination page size selection.
   *
   * @returns Cypress chainable.
   */
  findPageSizeSelect: () => {
    return pagination
      .find()
      .find('[data-qa-pagination-page-size]')
      .find('[role="combobox"]');
  },
};
