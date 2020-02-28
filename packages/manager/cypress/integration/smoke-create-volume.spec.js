import strings from '../support/cypresshelpers';

describe('cypress e2e poc', () => {
  beforeEach(() => {
    cy.login2();
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
});
