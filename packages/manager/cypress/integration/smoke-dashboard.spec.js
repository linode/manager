

describe('dashboard', () => {
  beforeEach(() => {
    cy.login2();
  });

  it('checks the dashboard page', () => {
    cy.visit('/');
    cy.get('[data-qa-header]').should('have.text', 'Dashboard');
    cy.get('[data-qa-card="Linodes"] h2').should('have.text', 'Linodes');
    cy.get('[data-qa-card="Volumes"] h2').should('have.text', 'Volumes');
    cy.get('[data-qa-card="Domains"] h2').should('have.text', 'Domains');
    cy.get('[data-qa-card="NodeBalancers"] h2').should(
      'have.text',
      'NodeBalancers'
    );
  });
});
