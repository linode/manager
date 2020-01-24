import strings from '../support/cypresshelpers';

describe('cypress e2e poc', () => {
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
  it('creates a volume', () => {
    const title = strings.randomTitle(30);

    cy.visit('/volumes/create');
    cy.url().should('contain', '/volumes/create');
    cy.get('[data-testid="link-text"]').should('have.text', 'volumes');
    cy.get('[data-qa-header]').should('have.text', 'Create');
    cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
      title
    );
    cy.contains('Region')
      .click()
      .type('new {enter}');
    cy.get('[data-qa-deploy-linode]').click();
    cy.get('[data-qa-drawer-title]').should(
      'have.text',
      'Volume Configuration'
    );
    cy.get('[data-qa-mountpoint] input').should(
      'have.value',
      `mkdir "/mnt/${title}"`
    );
    cy.contains('Close')
      .should('be.visible')
      .click();
  });
  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    cy.visit('/linodes/create');
    cy.get('[data-testid="link-text"]').should('have.text', 'linodes');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    cy.contains('Regions')
      .click()
      .type('new {enter}');
    cy.contains('Nanode').click();
    cy.get('[data-qa-plan-row="Nanode 1GB"]').click();
    cy.get('#root-password').type(rootpass);
    cy.get('[data-qa-deploy-linode]').click();
    cy.get('[data-qa-power-control="Busy"]').should('be.visible');
    // skipping this step to save time as we are not currently looking to test the
    // systems side of things
    // cy.get('[data-qa-power-control="Running"]', { timeout: 120000 }).should(
    //   'be.visible'
    // );
  });
});
