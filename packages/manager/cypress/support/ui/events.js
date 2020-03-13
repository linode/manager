export const assertToast = message => {
  cy.get('[data-qa-toast]').within(
    e => cy.findByText(message, { exact: false }).should('be.visible')
    // and should have class / success error
  );
};
