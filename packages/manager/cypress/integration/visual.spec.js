describe('visual regressions', () => {
  beforeEach(() => {
    cy.login2();
  });
  it('should display the nav bar correcly', () => {
    cy.visit('/support');
    cy.get('nav')
      .should('be.visible')
      .checkSnapshot('nav-menu', 0.0)
      .should('be.true');
  });
});
