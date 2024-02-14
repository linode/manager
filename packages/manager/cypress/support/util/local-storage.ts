/**
 * @file Utilities to access and validate Local Storage data.
 */

/**
 * Asserts that a local storage item has a given value.
 *
 * @param key - Local storage item key.
 * @param value - Local storage item value to assert.
 */
export const assertLocalStorageValue = (key: string, value: any) => {
  cy.getAllLocalStorage().then((localStorageData: any) => {
    const origin = Cypress.config('baseUrl');
    if (!origin) {
      // This should never happen in practice.
      throw new Error('Unable to retrieve Cypress base URL configuration');
    }
    if (!localStorageData[origin]) {
      throw new Error(
        `Unable to retrieve local storage data from origin '${origin}'`
      );
    }
    if (!localStorageData[origin][key]) {
      throw new Error(
        `No local storage data exists for key '${key}' and origin '${origin}'`
      );
    }
    expect(localStorageData[origin][key]).equals(value);
  });
};
