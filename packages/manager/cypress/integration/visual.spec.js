describe('visual regressions', () => {
  it('should display the nav bar correcly', () => {
    cy.visitWithLogin('/support');
    cy.get('nav')
      .should('be.visible')
      .checkSnapshot('nav-menu', 0.0)
      .should('be.true');
  });
});
