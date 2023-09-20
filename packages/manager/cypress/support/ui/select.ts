import { getRegionById, getRegionByLabel } from 'support/util/regions';

/**
 * UI helpers for Enhanced Select component.
 */
export const select = {
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

/**
 * UI helpers for region selection Enhanced Select.
 */
export const regionSelect = {
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
    return select.findItemByText(`${region.label} (${region.id})`);
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
    return select.findItemByText(`${region.label} (${region.id})`);
  },
};
