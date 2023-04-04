/**
 * Autocomplete Popper UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a autocomplete popper.
 */
export const autocompletePopper = {
  /**
   * Finds a autocomplete popper that has the given title.
   */
  findByTitle: (title: string): Cypress.Chainable => {
    return cy
      .findByText(`${title}`)
      .closest('[data-qa-autocomplete-popper="true"]');
  },
};
