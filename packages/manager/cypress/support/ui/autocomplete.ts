import { getRegionById, getRegionByLabel } from 'support/util/regions';

export const autocomplete = {
  /**
   * Finds a autocomplete popper that has the given title.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-autocomplete] input');
  },
};

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
      .document()
      .its('body')
      .find('[data-qa-autocomplete-popper]')
      .findByText(title);
  },
};

/**
 * UI helpers for region selection Autocomplete.
 */
export const regionSelect = {
  /**
   * Finds and open the region select input.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-testid="region-select"] input');
  },

  findBySelectedItem: (selectedRegion: string) => {
    return cy.get(`[value="${selectedRegion}"]`);
  },

  /**
   * Finds a Region Select menu item using the ID of a region.
   *
   * This assumes that the Region Select menu is already open.
   *
   * @param regionId - ID of region for which to find Region Select menu item.
   *
   * @returns Cypress chainable.
   */
  findItemByRegionId: (regionId: string) => {
    const region = getRegionById(regionId);
    return autocompletePopper.findByTitle(`${region.label} (${region.id})`);
  },

  /**
   * Finds a Region Select menu item using a region's label.
   *
   * This assumes that the Region Select menu is already open.
   *
   * @param regionLabel - Region label.
   *
   * @returns Cypress chainable.
   */
  findItemByRegionLabel: (regionLabel: string) => {
    const region = getRegionByLabel(regionLabel);
    return autocompletePopper.findByTitle(`${region.label} (${region.id})`);
  },
};
