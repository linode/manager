import { getRegionById, getRegionByLabel } from 'support/util/regions';

import type { SelectorMatcherOptions } from '@testing-library/cypress';
import type { Region } from '@linode/api-v4';

/**
 * Autocomplete UI element.
 */
export const autocomplete = {
  /**
   * Finds a autocomplete popper that has the given title.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-autocomplete] input');
  },
  /**
   * Finds an autocomplete input element by its placeholder text.
   * This method is useful for locating input fields within autocomplete components
   * when the placeholder text is known.
   *
   * @param {string} title - The placeholder text of the input element.
   * @param {SelectorMatcherOptions} [options] - Optional additional options for selecting elements.
   * @returns {Cypress.Chainable} - A Cypress chainable object that represents the located element.
   */
  findByPlaceholderCustom: (
    title: string,
    options?: SelectorMatcherOptions
  ): Cypress.Chainable => {
    return cy.get("[data-qa-autocomplete] input[placeholder='" + title + "']");
  },

  /**
   * Finds an autocomplete element by its title attribute.
   * This method is used to locate elements with a specific title attribute within
   * autocomplete components, useful for when you need to interact with elements
   * identified by their title.
   *
   * @param {string} title - The value of the title attribute for the autocomplete element.
   * @returns {Cypress.Chainable} - A Cypress chainable object that represents the located element.
   */
  findByTitleCustom: (title: string): Cypress.Chainable => {
    return cy.get('[data-qa-autocomplete="' + title + '"]');
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
   * Finds an open autocomplete popper.
   */
  find: () => {
    return cy.document().its('body').find('[data-qa-autocomplete-popper]');
  },

  /**
   * Finds an item within an autocomplete popper that has the given title.
   */
  findByTitle: (
    title: string,
    options?: SelectorMatcherOptions
  ): Cypress.Chainable => {
    return (
      cy
        .document()
        .its('body')
        .find('[data-qa-autocomplete-popper]')
        .findByText(title, options)
        // Scroll to the desired item before yielding.
        // Apply a negative top offset to account for cases where the desired
        // item may be obscured by the drop-down sticky category heading.
        .scrollIntoView({ offset: { left: 0, top: -45 } })
    );
  },
};

/**
 * UI helpers for region selection Autocomplete.
 */
export const regionSelect = {
  /**
   * Finds a region select input.
   *
   * This finds any element with the `region-select` test ID. In cases where
   * more than one region select may be on the screen, consider narrowing
   * your selection before using this helper.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-testid="region-select"] input');
  },

  /**
   * Finds a region select input by its current value.
   *
   * @param selectedRegion - Current selection for desired Region Select.
   *
   * @returns Cypress chainable.
   */
  findBySelectedItem: (selectedRegion: string) => {
    return cy.get(`[value="${selectedRegion}"]`);
  },

  /**
   * Finds a Region Select menu item using the ID of a region.
   *
   * This assumes that the Region Select menu is already open.
   *
   * @param regionId - ID of region to find in selection drop-down.
   * @param searchRegions - Optional array of regions from which to search.
   *
   * @returns Cypress chainable.
   */
  findItemByRegionId: (regionId: string, searchRegions?: Region[]) => {
    const region = getRegionById(regionId, searchRegions);
    return autocompletePopper.findByTitle(`${region.label} (${region.id})`);
  },

  /**
   * Finds a Region Select menu item using a region's label.
   *
   * This assumes that the Region Select menu is already open.
   *
   * @param regionLabel - Label of region to find in selection drop-down.
   * @param searchRegions - Optional array of regions from which to search.
   *
   * @returns Cypress chainable.
   */
  findItemByRegionLabel: (regionLabel: string, searchRegions?: Region[]) => {
    const region = getRegionByLabel(regionLabel, searchRegions);
    return autocompletePopper.findByTitle(`${region.label} (${region.id})`);
  },
};
