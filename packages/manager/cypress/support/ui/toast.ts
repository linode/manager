/**
 * Options that can be applied when waiting for a toast notification.
 */
export type ToastFindOptions = Partial<
  Cypress.Loggable &
    Cypress.Timeoutable &
    Cypress.CaseMatchable &
    Cypress.Shadow
>;

/**
 * Toast notification UI element.
 */
export const toast = {
  /**
   * Asserts that a toast notification with the given message is displayed.
   *
   * @param message - Message for the toast being asserted.
   * @param options - Optional Cypress options to find and wait for toast notification.
   *
   * @returns Cypress chainable.
   */
  assertMessage: (
    message: string,
    options?: ToastFindOptions | undefined
  ): void => {
    cy.contains(
      '[aria-describedby="notistack-snackbar"]',
      message,
      options
    ).should('be.visible');
  },

  /**
   * Finds a toast notification element by its message contents.
   *
   * Toast notifications are short lived, so actions or assertions should be
   * made as quickly as possible after finding the element.
   *
   * @param message - Message for the toast that should be found.
   * @param options - Optional Cypress options to find and wait for toast notification.
   *
   * @returns Cypress chainable.
   */
  findByMessage: (
    message: string,
    options?: ToastFindOptions | undefined
  ): Cypress.Chainable => {
    return cy.contains(
      '[aria-describedby="notistack-snackbar"]',
      message,
      options
    );
  },
};
