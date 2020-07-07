export const assertToast = (message: string, nthChild = 0) => {
  cy.get('[data-qa-toast]')
    .eq(nthChild)
    .within(() => {
      cy.contains(message).should('be.visible');
      // and should have class / success error
    });
};
