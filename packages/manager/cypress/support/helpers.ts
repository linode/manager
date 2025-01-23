/* These are shortened methods that will handle finding and clicking or
finding and asserting visible without having to chain. They don't chain off of cy */
const visible = 'be.visible';

/**
 * Deprecated. Use `cy.contains(text).should('be.visible')` instead.
 *
 * @deprecated
 */
export const containsVisible = (text: string) => {
  return cy.contains(text).should(visible);
};

/**
 * Deprecated. Use `cy.contains(text).click()` instead.
 *
 * @deprecated
 */
export const containsClick = (text: string) => {
  return cy.contains(text).click();
};

/**
 * Deprecated. Use `cy.findByPlaceholderText(text).click()` instead.
 *
 * @deprecated
 */
export const containsPlaceholderClick = (text: string) => {
  return cy.get(`[placeholder="${text}"]`).click();
};

/**
 * Deprecated. Use `cy.get(element).should('be.visible')` instead.
 *
 * @deprecated
 */
export const getVisible = (element: string) => {
  return cy.get(element).should(visible);
};

/**
 * Deprecated. Use `cy.get(element).click()` instead.
 *
 * @deprecated
 */
export const getClick = (element: string) => {
  return cy.get(element).click();
};

/**
 * Deprecated. Use `cy.findByText(text).should('be.visible')` instead.
 *
 * @deprecated
 */
export const fbtVisible = (text: string) => {
  return cy.findByText(text).should(visible);
};

/**
 * Deprecated. Use `cy.findByText(text).click()` instead.
 *
 * @deprecated
 */
export const fbtClick = (text: string) => {
  return cy.findByText(text).click();
};

/**
 * Deprecated. Use `cy.findByLabelText(text).should('be.visible')` instead.
 *
 * @deprecated
 */
export const fbltVisible = (text: string) => {
  return cy.findByLabelText(text).should(visible);
};

/**
 * Deprecated. Use `cy.findByLabelText(text).click()` instead.
 *
 * @deprecated
 */
export const fbltClick = (text: string) => {
  return cy.findByLabelText(text).click();
};
