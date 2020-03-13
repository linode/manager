describe('visual regressions', () => {
  beforeEach(() => {
    cy.login2();
  });
  it('should display the help search correcly', () => {
    cy.visit('/support');
    cy.get('[data-qa-tile="Linode Support Bot"]')
      .checkSnapshot('support-bot-tile', 0.0)
      .should('be.true');
  });
});
