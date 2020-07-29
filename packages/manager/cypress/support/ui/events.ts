export const assertToast = (message: string, elementNumber: number = 1) => {
  cy.get('[data-qa-toast]')
    .then(elements => {
      if (elementNumber !== 1) {
        return elements[elementNumber - 1];
      }
    })
    .within(_element =>
      cy.findByText(message, { exact: false }).should('be.visible')
    );
};
