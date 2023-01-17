import { regionsMap } from 'support/constants/regions';

/**
 * UI helpers for Enhanced Select component.
 */
export const select = {
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
    const regionName = regionsMap[regionId];

    if (!regionName) {
      throw new Error(`Unable to find a region name for ID '${regionId}'`);
    }

    return select.findItemByText(`${regionName} (${regionId})`);
  },

  /**
   * Finds a Region Select menu item using the name of a region.
   *
   * This assumes that the Region Select menu is already open.
   *
   * @param regionName - Region name.
   *
   * @returns Cypress chainable.
   */
  findItemByRegionName: (regionName: string) => {
    const regionId = Object.keys(regionsMap).find(
      (regionIdKey) => regionsMap[regionIdKey] === regionName
    );

    if (!regionId) {
      throw new Error(
        `Unable to find a region ID for region name '${regionName}'`
      );
    }

    return select.findItemByText(`${regionName} (${regionId})`);
  },
};
