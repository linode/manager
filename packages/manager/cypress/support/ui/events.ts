export const assertToast = (message: string) => {
  cy.get('[data-qa-toast]').within(
    _e => cy.findByText(message, { exact: false }).should('be.visible')
    // and should have class / success error
  );
};
